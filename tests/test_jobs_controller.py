from __future__ import annotations

import asyncio
import contextlib
import importlib
from typing import Any

import httpx
import pytest

from miro_backend.db.session import Base, SessionLocal, engine
from miro_backend.models import Job
from miro_backend.queue import ChangeQueue
from miro_backend.queue.provider import get_change_queue


class SlowClient:
    """Client that sleeps to expose intermediate job states."""

    async def create_node(self, *_: Any) -> None:  # pragma: no cover - stub
        await asyncio.sleep(0.05)

    async def update_card(self, *_: Any) -> None:  # pragma: no cover - stub
        await asyncio.sleep(0.05)


@pytest.mark.asyncio()  # type: ignore[misc]
async def test_job_status_transitions(monkeypatch: pytest.MonkeyPatch) -> None:
    Base.metadata.create_all(bind=engine)
    try:
        app_module = importlib.import_module("miro_backend.main")
        queue = ChangeQueue()
        app_module.app.dependency_overrides[get_change_queue] = lambda: queue

        async def _token(*_: Any) -> str:
            return "t"

        monkeypatch.setattr(
            "miro_backend.queue.change_queue.get_valid_access_token", _token
        )

        async with httpx.AsyncClient(
            app=app_module.app, base_url="http://test"
        ) as client:
            body = {
                "operations": [
                    {"type": "create_node", "node_id": "n1", "data": {"x": 1}},
                    {"type": "update_card", "card_id": "c1", "payload": {"y": 2}},
                ]
            }
            resp = await client.post(
                "/api/batch", json=body, headers={"X-User-Id": "u1"}
            )
            assert resp.status_code == 202
            job_id = resp.json()["job_id"]

            # Job should start as queued
            with SessionLocal() as session:
                job = session.get(Job, job_id)
                assert job is not None
                assert job.status == "queued"

            worker_session = SessionLocal()
            worker = asyncio.create_task(queue.worker(worker_session, SlowClient()))
            statuses: list[str] = []
            try:
                while True:
                    await asyncio.sleep(0.02)
                    with SessionLocal() as session:
                        job = session.get(Job, job_id)
                        assert job is not None
                        statuses.append(job.status)
                        if job.status == "succeeded":
                            break
            finally:
                worker.cancel()
                with contextlib.suppress(asyncio.CancelledError):
                    await worker
                worker_session.close()

            assert "running" in statuses

            result = await client.get(f"/api/jobs/{job_id}")
            assert result.status_code == 200
            data = result.json()
            assert data["status"] == "succeeded"
            assert len(data["results"]["operations"]) == 2
    finally:
        app_module.app.dependency_overrides.clear()
        Base.metadata.drop_all(bind=engine)
