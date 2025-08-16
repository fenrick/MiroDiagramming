"""Tests for job inspection endpoints."""

from __future__ import annotations

import asyncio
import contextlib

import pytest
from fastapi.testclient import TestClient
from pathlib import Path

from miro_backend.main import app
from miro_backend.queue.change_queue import ChangeQueue
from miro_backend.queue.persistence import QueuePersistence
from miro_backend.queue.provider import get_change_queue


@pytest.mark.asyncio  # type: ignore[misc]
async def test_job_lifecycle(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    persistence = QueuePersistence(tmp_path / "queue.db")
    queue = ChangeQueue(persistence=persistence)
    app.dependency_overrides[get_change_queue] = lambda: queue
    client = TestClient(app)

    body = {
        "operations": [
            {"type": "create_node", "node_id": "n1", "data": {"x": 1}},
            {"type": "create_node", "node_id": "n2", "data": {"x": 2}},
        ]
    }
    response = client.post("/api/batch", json=body, headers={"X-User-Id": "u1"})
    job_id = response.json()["job_id"]

    queued = client.get(f"/api/jobs/{job_id}").json()
    assert queued == {"job_id": job_id, "status": "queued", "results": []}

    class FakeClient:
        async def create_node(self, *_: object, **__: object) -> None:
            await asyncio.sleep(0.05)

    async def _token(*_: object) -> str:
        return "t"

    monkeypatch.setattr(
        "miro_backend.queue.change_queue.get_valid_access_token", _token
    )

    worker = asyncio.create_task(queue.worker(object(), FakeClient()))
    await asyncio.sleep(0.01)

    running = client.get(f"/api/jobs/{job_id}").json()
    assert running["status"] == "running"

    await asyncio.sleep(0.2)
    worker.cancel()
    with contextlib.suppress(asyncio.CancelledError):
        await worker

    finished = client.get(f"/api/jobs/{job_id}").json()
    assert finished["status"] == "succeeded"
    assert len(finished["results"]) == 2

    app.dependency_overrides.clear()
