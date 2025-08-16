"""Ensure the change queue interacts with persistence layers."""

from __future__ import annotations

from unittest import mock

import pytest

from miro_backend.queue import ChangeQueue
from miro_backend.queue.persistence import QueuePersistence
from miro_backend.queue.tasks import CreateNode


@pytest.mark.asyncio()  # type: ignore[misc]
async def test_enqueue_dequeue_persists() -> None:
    """Enqueue and dequeue should call persistence hooks."""

    persistence = mock.AsyncMock()
    persistence.load = mock.Mock(return_value=[])
    queue = ChangeQueue(persistence=persistence)
    task = CreateNode(node_id="n1", data={}, user_id="u1")

    await queue.enqueue(task)
    persistence.save.assert_awaited_once_with(task)

    await queue.dequeue()
    persistence.delete.assert_awaited_once_with(task)


@pytest.mark.asyncio()  # type: ignore[misc]
async def test_tasks_survive_restart() -> None:
    """Tasks persisted to disk should reload after a restart."""

    persistence = QueuePersistence()

    queue = ChangeQueue(persistence=persistence)
    task = CreateNode(node_id="n1", data={}, user_id="u1")
    await queue.enqueue(task)

    restored = ChangeQueue(persistence=persistence)
    loaded = await restored.dequeue()
    assert loaded == task

    empty = ChangeQueue(persistence=persistence)
    assert empty._queue.empty()
