"""Tests for the batch operations endpoint."""

from __future__ import annotations

from collections.abc import Iterator
from typing import Any

import pytest
from fastapi.testclient import TestClient

from miro_backend.schemas.batch import MAX_BATCH_OPERATIONS

from miro_backend.main import app
from miro_backend.queue.provider import get_change_queue
from miro_backend.queue.tasks import CreateNode, UpdateCard
from miro_backend.db.session import Base, engine


class MemoryPersistence:
    """In-memory store for idempotency responses."""

    def __init__(self) -> None:
        self.responses: dict[str, dict[str, Any]] = {}

    async def get_idempotent(self, key: str) -> dict[str, Any] | None:
        return self.responses.get(key)

    async def save_idempotent(self, key: str, response: dict[str, Any]) -> None:
        self.responses[key] = response


class DummyQueue:
    """Simple queue capturing enqueued tasks."""

    def __init__(self, persistence: MemoryPersistence | None = None) -> None:
        self.tasks: list[object] = []
        self.persistence = persistence

    async def enqueue(self, task: object) -> None:
        self.tasks.append(task)


# mypy struggles with pytest fixtures
@pytest.fixture  # type: ignore[misc]
def client_queue() -> Iterator[tuple[TestClient, DummyQueue]]:
    Base.metadata.create_all(bind=engine)
    persistence = MemoryPersistence()
    queue = DummyQueue(persistence=persistence)
    app.dependency_overrides[get_change_queue] = lambda: queue
    client = TestClient(app)
    yield client, queue
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)


def test_post_batch_enqueues_tasks(client_queue: tuple[TestClient, DummyQueue]) -> None:
    client, queue = client_queue
    body = {
        "operations": [
            {"type": "create_node", "node_id": "n1", "data": {"x": 1}},
            {"type": "update_card", "card_id": "c1", "payload": {"y": 2}},
        ]
    }
    response = client.post("/api/batch", json=body, headers={"X-User-Id": "u1"})
    assert response.status_code == 202
    data = response.json()
    assert data["enqueued"] == 2
    assert isinstance(data["job_id"], str)
    assert len(queue.tasks) == 2
    assert isinstance(queue.tasks[0], CreateNode)
    assert isinstance(queue.tasks[1], UpdateCard)
    assert queue.tasks[0].user_id == "u1"
    assert queue.tasks[1].user_id == "u1"


def test_post_batch_validates_payload(
    client_queue: tuple[TestClient, DummyQueue]
) -> None:
    client, _ = client_queue
    body = {"operations": [{"type": "create_node", "node_id": "n1"}]}
    response = client.post("/api/batch", json=body, headers={"X-User-Id": "u1"})
    assert response.status_code == 422


def test_post_batch_returns_cached_response(
    client_queue: tuple[TestClient, DummyQueue]
) -> None:
    client, queue = client_queue
    assert queue.persistence is not None
    queue.persistence.responses["key1"] = {"enqueued": 3, "job_id": "j1"}
    body = {"operations": [{"type": "create_node", "node_id": "n1", "data": {"x": 1}}]}
    response = client.post(
        "/api/batch",
        json=body,
        headers={"Idempotency-Key": "key1", "X-User-Id": "u1"},
    )
    assert response.status_code == 202
    assert response.json() == {"enqueued": 3, "job_id": "j1"}
    assert len(queue.tasks) == 0


def test_post_batch_saves_idempotent_response(
    client_queue: tuple[TestClient, DummyQueue]
) -> None:
    client, queue = client_queue
    key = "key2"
    body = {
        "operations": [
            {"type": "create_node", "node_id": "n1", "data": {"x": 1}},
            {"type": "update_card", "card_id": "c1", "payload": {"y": 2}},
        ]
    }
    response = client.post(
        "/api/batch",
        json=body,
        headers={"Idempotency-Key": key, "X-User-Id": "u1"},
    )
    assert response.status_code == 202
    data = response.json()
    assert data["enqueued"] == 2
    assert isinstance(data["job_id"], str)
    assert queue.persistence is not None
    assert queue.persistence.responses[key] == data


def test_post_batch_rejects_oversized_batch(
    client_queue: tuple[TestClient, DummyQueue]
) -> None:
    client, _ = client_queue
    operations = [
        {"type": "create_node", "node_id": str(i), "data": {}}
        for i in range(MAX_BATCH_OPERATIONS + 1)
    ]
    body = {"operations": operations}
    response = client.post("/api/batch", json=body, headers={"X-User-Id": "u1"})
    assert response.status_code == 422
    assert "Batch cannot exceed" in response.text
