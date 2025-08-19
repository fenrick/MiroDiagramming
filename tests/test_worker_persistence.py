"""Tests for worker concurrency and recovery with persistence."""

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
from miro_backend.queue.persistence import SqlAlchemyQueuePersistence


class RecordingClient:
    """Client capturing processed node creations."""

    def __init__(self) -> None:
        self.calls = 0
        self.created: list[tuple[str, dict[str, int]]] = []

    async def create_node(
        self, node_id: str, data: dict[str, int], _token: str
    ) -> None:
        self.calls += 1
        self.created.append((node_id, data))


@pytest.mark.asyncio()  # type: ignore[misc]
async def test_two_workers_only_one_processes(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Launching two workers should not duplicate processing."""

    engine = create_engine(
        f"sqlite:///{tmp_path/'tasks.db'}", connect_args={"check_same_thread": False}
    )
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    persistence = SqlAlchemyQueuePersistence(Session)
    queue = ChangeQueue(persistence=persistence)
    client = RecordingClient()

    async def _token(*_: object) -> str:
        return "t"

    monkeypatch.setattr(
        "miro_backend.queue.change_queue.get_valid_access_token", _token
    )

    await queue.enqueue(CreateNode(node_id="n1", data={"x": 1}, user_id="u1"))
    worker1 = asyncio.create_task(queue.worker(Session(), client))
    worker2 = asyncio.create_task(queue.worker(Session(), client))
    try:
        while client.calls < 1:
            await asyncio.sleep(0)
        await asyncio.sleep(0)
    finally:
        worker1.cancel()
        worker2.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await asyncio.gather(worker1, worker2)

    assert client.calls == 1
    assert queue._queue.empty()
    for _ in range(10):
        if not queue.persistence.load():
            break
        await asyncio.sleep(0.01)
    assert queue.persistence.load() == []


class FailingClient:
    """Client that fails permanently processing a node."""

    def __init__(self) -> None:
        self.calls = 0

    async def create_node(
        self, node_id: str, data: dict[str, int], _token: str
    ) -> None:
        self.calls += 1
        raise RuntimeError("boom")


@pytest.mark.asyncio()  # type: ignore[misc]
async def test_task_removed_after_permanent_failure(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    """A non-retryable failure should remove the task from persistence."""

    engine = create_engine(
        f"sqlite:///{tmp_path/'tasks.db'}", connect_args={"check_same_thread": False}
    )
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    persistence = SqlAlchemyQueuePersistence(Session)
    queue = ChangeQueue(persistence=persistence)

    async def _token(*_: object) -> str:
        return "t"

    monkeypatch.setattr(
        "miro_backend.queue.change_queue.get_valid_access_token", _token
    )

    failing = FailingClient()
    await queue.enqueue(CreateNode(node_id="n1", data={"x": 1}, user_id="u1"))
    worker1 = asyncio.create_task(queue.worker(Session(), failing))
    with pytest.raises(RuntimeError):
        await worker1
    assert failing.calls == 1
    assert queue._queue.empty()
    assert queue.persistence.load() == []


class ReadTimeoutOnceClient:
    """Client that times out once before succeeding."""

    def __init__(self) -> None:
        self.calls = 0
        self.created: list[tuple[str, dict[str, int]]] = []

    async def create_node(
        self, node_id: str, data: dict[str, int], _token: str
    ) -> None:
        self.calls += 1
        if self.calls == 1:
            raise httpx.ReadTimeout("timeout")
        self.created.append((node_id, data))


@pytest.mark.asyncio()  # type: ignore[misc]
async def test_worker_retries_read_timeout(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    """ReadTimeout should trigger a retry and eventually succeed."""

    engine = create_engine(
        f"sqlite:///{tmp_path/'tasks.db'}", connect_args={"check_same_thread": False}
    )
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    persistence = SqlAlchemyQueuePersistence(Session)
    queue = ChangeQueue(persistence=persistence)
    client = ReadTimeoutOnceClient()

    async def _token(*_: object) -> str:
        return "t"

    real_sleep = asyncio.sleep

    async def fake_sleep(delay: float) -> None:
        if delay:
            await real_sleep(0)
        else:
            await real_sleep(0)

    monkeypatch.setattr(
        "miro_backend.queue.change_queue.get_valid_access_token", _token
    )
    monkeypatch.setattr("miro_backend.queue.change_queue.asyncio.sleep", fake_sleep)
    monkeypatch.setattr(
        "miro_backend.queue.change_queue.random.uniform", lambda _a, _b: 0
    )

    await queue.enqueue(CreateNode(node_id="n1", data={"x": 1}, user_id="u1"))
    worker = asyncio.create_task(queue.worker(Session(), client))
    try:
        while not client.created:
            await real_sleep(0)
        for _ in range(10):
            if not queue.persistence.load():
                break
            await asyncio.sleep(0.01)
    finally:
        worker.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await worker

    assert client.created == [("n1", {"x": 1})]
    assert client.calls == 2
    assert queue._queue.empty()
    assert queue.persistence.load() == []
