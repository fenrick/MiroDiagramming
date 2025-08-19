"""Tests for the shapes router."""

from __future__ import annotations

import asyncio
from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient

from miro_backend.main import app
from miro_backend.queue import (
    ChangeQueue,
    CreateShape,
    UpdateShape,
    DeleteShape,
    get_change_queue,
)
from miro_backend.schemas.shape import Shape
from miro_backend.services.shape_store import (
    InMemoryShapeStore,
    get_shape_store,
)


@pytest.fixture  # type: ignore[misc]
def client_store_queue() -> (
    Iterator[tuple[TestClient, InMemoryShapeStore, ChangeQueue]]
):
    store = InMemoryShapeStore()
    queue = ChangeQueue()
    app.dependency_overrides[get_shape_store] = lambda: store
    app.dependency_overrides[get_change_queue] = lambda: queue
    client = TestClient(app)
    yield client, store, queue
    app.dependency_overrides.clear()


def test_create_shape_enqueues_task_and_returns_shape(
    client_store_queue: tuple[TestClient, InMemoryShapeStore, ChangeQueue],
) -> None:
    client, store, queue = client_store_queue
    store.add_board("b1", "u1")
    response = client.post(
        "/api/boards/b1/shapes/",
        headers={"X-User-Id": "u1"},
        json={"content": "c"},
    )
    assert response.status_code == 201
    body = response.json()
    assert store.get("b1", body["id"]) is not None
    task = asyncio.run(queue.dequeue())
    assert isinstance(task, CreateShape)
    assert task.board_id == "b1"
    assert task.data == {"content": "c"}
    assert task.user_id == "u1"


def test_update_shape_enqueues_task(
    client_store_queue: tuple[TestClient, InMemoryShapeStore, ChangeQueue],
) -> None:
    client, store, queue = client_store_queue
    store.add_board("b1", "u1")
    store.create("b1", Shape(id="s1", content="old"))
    response = client.put(
        "/api/boards/b1/shapes/s1",
        headers={"X-User-Id": "u1"},
        json={"content": "new"},
    )
    assert response.status_code == 200
    assert store.get("b1", "s1").content == "new"
    task = asyncio.run(queue.dequeue())
    assert isinstance(task, UpdateShape)
    assert task.shape_id == "s1"
    assert task.user_id == "u1"


def test_delete_shape_enqueues_task(
    client_store_queue: tuple[TestClient, InMemoryShapeStore, ChangeQueue],
) -> None:
    client, store, queue = client_store_queue
    store.add_board("b1", "u1")
    store.create("b1", Shape(id="s1", content="c"))
    response = client.delete("/api/boards/b1/shapes/s1", headers={"X-User-Id": "u1"})
    assert response.status_code == 204
    assert store.get("b1", "s1") is None
    task = asyncio.run(queue.dequeue())
    assert isinstance(task, DeleteShape)
    assert task.board_id == "b1"
    assert task.user_id == "u1"


def test_get_shape_enforces_board_ownership(
    client_store_queue: tuple[TestClient, InMemoryShapeStore, ChangeQueue],
) -> None:
    client, store, _ = client_store_queue
    store.add_board("b1", "u1")
    store.create("b1", Shape(id="s1", content="c"))
    response = client.get("/api/boards/b1/shapes/s1", headers={"X-User-Id": "u2"})
    assert response.status_code == 403


def test_get_shape_returns_not_found_for_missing_item(
    client_store_queue: tuple[TestClient, InMemoryShapeStore, ChangeQueue],
) -> None:
    client, store, _ = client_store_queue
    store.add_board("b1", "u1")
    response = client.get("/api/boards/b1/shapes/unknown", headers={"X-User-Id": "u1"})
    assert response.status_code == 404
