"""Tests for DLQ and retry metrics in ChangeQueue worker."""

from __future__ import annotations

import asyncio
import contextlib
from pathlib import Path

import httpx
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from miro_backend.db.session import Base
from miro_backend.queue import ChangeQueue, CreateNode
from miro_backend.queue.change_queue import task_dlq, task_retries
from miro_backend.queue.persistence import DeadLetterTask, SqlAlchemyQueuePersistence


class AlwaysFailClient:
    """Client that always raises a retryable network error."""

    def __init__(self) -> None:
        self.calls = 0

    async def create_node(
        self, node_id: str, data: dict[str, int], _token: str
    ) -> None:
        self.calls += 1
        raise httpx.ReadTimeout("boom")


@pytest.mark.asyncio()  # type: ignore[misc]
async def test_dlq_and_retry_metrics(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Task failing all retries should land in DLQ and update metrics."""

    engine = create_engine(
        f"sqlite:///{tmp_path/'tasks.db'}", connect_args={"check_same_thread": False}
    )
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    persistence = SqlAlchemyQueuePersistence(Session)
    queue = ChangeQueue(persistence=persistence)
    client = AlwaysFailClient()

    async def _token(*_: object) -> str:
        return "t"

    real_sleep = asyncio.sleep

    async def fake_sleep(_: float) -> None:
        await real_sleep(0)

    monkeypatch.setattr(
        "miro_backend.queue.change_queue.get_valid_access_token", _token
    )
    monkeypatch.setattr("miro_backend.queue.change_queue.asyncio.sleep", fake_sleep)
    monkeypatch.setattr(
        "miro_backend.queue.change_queue.random.uniform", lambda _a, _b: 0
    )

    task_retries.labels(type="CreateNode")._value.set(0)
    task_dlq.labels(type="CreateNode")._value.set(0)

    await queue.enqueue(CreateNode(node_id="n1", data={}, user_id="u1"))
    worker = asyncio.create_task(queue.worker(Session(), client))
    try:
        while client.calls < 5:
            await real_sleep(0)
        for _ in range(10):
            if not queue.persistence.load():
                break
            await real_sleep(0.01)
    finally:
        worker.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await worker

    assert client.calls == 5
    assert task_retries.labels(type="CreateNode")._value.get() == 5
    assert task_dlq.labels(type="CreateNode")._value.get() == 1
    with Session() as s:
        assert s.query(DeadLetterTask).count() == 1
