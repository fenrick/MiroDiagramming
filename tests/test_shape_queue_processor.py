"""Translation of ``ShapeQueueProcessorTests`` for the Python queue implementation."""
from __future__ import annotations

import asyncio
import contextlib

import pytest

from miro_backend.queue import ChangeQueue, CreateNode, UpdateCard


class FakeClient:
    def __init__(self) -> None:
        self.created: list[tuple[str, dict[str, int]]] = []
        self.updated: list[tuple[str, dict[str, int]]] = []

    async def create_node(self, node_id: str, data: dict[str, int]) -> None:
        self.created.append((node_id, data))

    async def update_card(self, card_id: str, payload: dict[str, int]) -> None:
        self.updated.append((card_id, payload))


@pytest.mark.asyncio
async def test_worker_processes_tasks() -> None:
    queue = ChangeQueue()
    client = FakeClient()

    worker = asyncio.create_task(queue.worker(client))

    await queue.enqueue(CreateNode(node_id="1", data={"x": 1}))
    await queue.enqueue(UpdateCard(card_id="c1", payload={"y": 2}))

    await asyncio.sleep(0.1)

    worker.cancel()
    with contextlib.suppress(asyncio.CancelledError):
        await worker

    assert client.created == [("1", {"x": 1})]
    assert client.updated == [("c1", {"y": 2})]
