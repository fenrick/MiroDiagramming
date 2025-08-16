"""Integration tests for shape routes."""

from __future__ import annotations

import httpx
import pytest

from typing import TYPE_CHECKING

from miro_backend.queue.tasks import CreateShape
from miro_backend.schemas.shape import ShapeCreate
from miro_backend.services.shape_store import get_shape_store

if TYPE_CHECKING:
    from .conftest import DummyQueue


@pytest.mark.integration  # type: ignore[misc]
@pytest.mark.asyncio  # type: ignore[misc]
async def test_create_shape_enqueues_task(
    client_queue: tuple[httpx.AsyncClient, "DummyQueue"]
) -> None:
    """Creating a shape should persist it and enqueue a change task."""

    client, queue = client_queue
    store = get_shape_store()
    store.add_board("b1", "user-1")

    payload = ShapeCreate(content="box").model_dump()
    response = await client.post(
        "/api/boards/b1/shapes/",
        headers={"X-User-Id": "user-1"},
        json=payload,
    )
    assert response.status_code == 201
    data = response.json()
    assert data["content"] == "box"
    assert len(queue.tasks) == 1
    task = queue.tasks[0]
    assert isinstance(task, CreateShape)
    assert task.board_id == "b1"
    assert task.shape_id == data["id"]
    assert task.user_id == "user-1"
