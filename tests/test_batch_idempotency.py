"""Tests idempotency behaviour of the batch endpoint with persistence."""

from __future__ import annotations

from collections.abc import Iterator
import asyncio

import pytest
from fastapi.testclient import TestClient

from miro_backend.api.routers import batch as batch_router
from miro_backend.main import app
from miro_backend.queue import ChangeQueue
from miro_backend.queue.change_queue import change_queue_length
from miro_backend.queue.provider import get_change_queue
from miro_backend.queue.persistence import QueuePersistence


@pytest.fixture  # type: ignore[misc]
def client() -> Iterator[TestClient]:
    persistence = QueuePersistence()
    queue = ChangeQueue(persistence=persistence)
    app.dependency_overrides[get_change_queue] = lambda: queue
    client = TestClient(app)
    yield client
    for task in queue.persistence.load():
        asyncio.run(queue.persistence.delete(task))
    change_queue_length.set(0)
    app.dependency_overrides.clear()


def test_post_batch_idempotent_across_restart(client: TestClient) -> None:
    body = {
        "operations": [
            {"type": "create_node", "node_id": "n1", "data": {"x": 1}},
            {"type": "update_card", "card_id": "c1", "payload": {"y": 2}},
        ]
    }
    headers = {"Idempotency-Key": "abc123", "X-User-Id": "u1"}

    first = client.post("/api/batch", json=body, headers=headers)

    # Simulate new process by clearing in-memory cache and creating a new client
    batch_router._IDEMPOTENCY_CACHE.clear()
    app.dependency_overrides[get_change_queue] = lambda: ChangeQueue(
        persistence=QueuePersistence()
    )
    new_client = TestClient(app)
    second = new_client.post("/api/batch", json=body, headers=headers)

    assert first.json() == second.json()
