"""Ensure the change queue interacts with persistence layers."""

from __future__ import annotations

from unittest import mock

import pytest

from miro_backend.queue import ChangeQueue
from miro_backend.queue.tasks import CreateNode


@pytest.mark.asyncio()  # type: ignore[misc]
async def test_enqueue_dequeue_persists() -> None:
    """Enqueue and dequeue should call persistence hooks."""

    persistence = mock.AsyncMock()
    queue = ChangeQueue(persistence=persistence)
    task = CreateNode(node_id="n1", data={})

    await queue.enqueue(task)
    persistence.save.assert_awaited_once_with(task)

    await queue.dequeue()
    persistence.delete.assert_awaited_once_with(task)
