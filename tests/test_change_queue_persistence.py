"""Ensure the change queue interacts with persistence layers."""

from __future__ import annotations

from unittest import mock

from pathlib import Path

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from miro_backend.db.session import Base
from miro_backend.queue import ChangeQueue
from miro_backend.queue.persistence import (
    SqlAlchemyQueuePersistence,
    QueuedTask,
)
from miro_backend.queue.tasks import CreateNode


@pytest.mark.asyncio()  # type: ignore[misc]
async def test_enqueue_dequeue_persists() -> None:
    """Ensure persistence helpers are invoked for success."""

    persistence = mock.AsyncMock()
    persistence.save = mock.AsyncMock(return_value=1)
    persistence.claim_next = mock.AsyncMock(return_value=None)
    queue = ChangeQueue(persistence=persistence)
    task = CreateNode(node_id="n1", data={}, user_id="u1")

    await queue.enqueue(task)
    persistence.save.assert_awaited_once_with(task)

    await queue.dequeue()
    persistence.claim_next.assert_not_awaited()
    persistence.delete.assert_not_called()

    await queue.mark_task_succeeded(task)
    persistence.mark_completed.assert_awaited_once_with(1)
    persistence.delete.assert_awaited_once_with(1)


@pytest.mark.asyncio()  # type: ignore[misc]
async def test_tasks_survive_restart(tmp_path: Path) -> None:
    """Tasks persisted to disk should reload after a restart."""

    engine = create_engine(
        f"sqlite:///{tmp_path/'tasks.db'}", connect_args={"check_same_thread": False}
    )
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    persistence = SqlAlchemyQueuePersistence(Session)

    queue = ChangeQueue(persistence=persistence)
    task = CreateNode(node_id="n1", data={}, user_id="u1")
    await queue.enqueue(task)

    restored = ChangeQueue(persistence=persistence)
    loaded = await restored.dequeue()
    assert loaded == task

    await restored.mark_task_succeeded(loaded)

    empty = ChangeQueue(persistence=persistence)
    assert empty._queue.empty()
    assert await empty.persistence.claim_next() is None


@pytest.mark.asyncio()  # type: ignore[misc]
async def test_ack_failure_removes_task(tmp_path: Path) -> None:
    """Failed tasks should be removed from persistence."""

    engine = create_engine(
        f"sqlite:///{tmp_path/'tasks.db'}", connect_args={"check_same_thread": False}
    )
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    persistence = SqlAlchemyQueuePersistence(Session)

    queue = ChangeQueue(persistence=persistence)
    task = CreateNode(node_id="n1", data={}, user_id="u1")
    await queue.enqueue(task)

    await queue.ack_task_failed(task)

    with Session() as s:
        assert s.query(QueuedTask).count() == 0
