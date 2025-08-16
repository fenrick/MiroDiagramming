"""Tests idempotency behaviour of the batch endpoint."""

from __future__ import annotations

import asyncio
from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient

from miro_backend.main import app
from miro_backend.queue.provider import get_change_queue
from .utils.queues import DummyQueue


class TrackingQueue(DummyQueue):
    """Queue that counts dequeue operations."""

    def __init__(self) -> None:
        super().__init__()
        self.dequeued = 0

    async def dequeue(self) -> object:
        self.dequeued += 1
        return self.tasks.pop(0)


@pytest.fixture  # type: ignore[misc]
def client_queue() -> Iterator[tuple[TestClient, TrackingQueue]]:
    queue = TrackingQueue()
    app.dependency_overrides[get_change_queue] = lambda: queue
    client = TestClient(app)
    yield client, queue
    app.dependency_overrides.clear()


def test_post_batch_is_idempotent(
    client_queue: tuple[TestClient, TrackingQueue]
) -> None:
    client, queue = client_queue
    body = {
        "operations": [
            {"type": "create_node", "node_id": "n1", "data": {"x": 1}},
            {"type": "update_card", "card_id": "c1", "payload": {"y": 2}},
        ]
    }
    headers = {"Idempotency-Key": "abc123", "X-User-Id": "u1"}

    first = client.post("/api/batch", json=body, headers=headers)
    second = client.post("/api/batch", json=body, headers=headers)

    assert first.json() == second.json()

    async def drain(q: TrackingQueue) -> None:
        while q.tasks:
            await q.dequeue()

    asyncio.run(drain(queue))
    assert queue.dequeued == len(body["operations"])
