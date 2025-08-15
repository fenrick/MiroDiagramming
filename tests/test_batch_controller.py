"""Tests for the batch operations endpoint."""

from __future__ import annotations

from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient

from miro_backend.main import app
from miro_backend.queue.provider import get_change_queue
from miro_backend.queue.tasks import CreateNode, UpdateCard


class DummyQueue:
    """Simple queue capturing enqueued tasks."""

    def __init__(self) -> None:
        self.tasks: list[object] = []

    async def enqueue(self, task: object) -> None:
        self.tasks.append(task)


# mypy struggles with pytest fixtures
@pytest.fixture  # type: ignore[misc]
def client_queue() -> Iterator[tuple[TestClient, DummyQueue]]:
    queue = DummyQueue()
    app.dependency_overrides[get_change_queue] = lambda: queue
    client = TestClient(app)
    yield client, queue
    app.dependency_overrides.clear()


def test_post_batch_enqueues_tasks(client_queue: tuple[TestClient, DummyQueue]) -> None:
    client, queue = client_queue
    body = {
        "operations": [
            {"type": "create_node", "node_id": "n1", "data": {"x": 1}},
            {"type": "update_card", "card_id": "c1", "payload": {"y": 2}},
        ]
    }
    response = client.post("/api/batch", json=body)
    assert response.status_code == 202
    assert response.json() == {"enqueued": 2}
    assert len(queue.tasks) == 2
    assert isinstance(queue.tasks[0], CreateNode)
    assert isinstance(queue.tasks[1], UpdateCard)


def test_post_batch_validates_payload(
    client_queue: tuple[TestClient, DummyQueue]
) -> None:
    client, _ = client_queue
    body = {"operations": [{"type": "create_node", "node_id": "n1"}]}
    response = client.post("/api/batch", json=body)
    assert response.status_code == 422
