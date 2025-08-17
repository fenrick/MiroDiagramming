"""Test that the worker enforces per-user token bucket spacing."""

from __future__ import annotations

import asyncio
import contextlib

import pytest

from miro_backend.queue import ChangeQueue, CreateNode


class RecordingClient:
    """Client that records call times for verification."""

    def __init__(self) -> None:
        self.calls: list[float] = []

    async def create_node(
        self, node_id: str, data: dict[str, int], _token: str
    ) -> None:
        self.calls.append(asyncio.get_running_loop().time())


@pytest.mark.asyncio()  # type: ignore[misc]
async def test_worker_enforces_token_bucket(monkeypatch: pytest.MonkeyPatch) -> None:
    interval_ms = 50
    queue = ChangeQueue(bucket_refresh_interval_ms=interval_ms)
    client = RecordingClient()

    async def _token(*_: object) -> str:
        return "t"

    monkeypatch.setattr(
        "miro_backend.queue.change_queue.get_valid_access_token", _token
    )

    worker = asyncio.create_task(queue.worker(object(), client))
    try:
        for i in range(3):
            await queue.enqueue(
                CreateNode(node_id=f"n{i}", data={"x": i}, user_id="u1")
            )
        while len(client.calls) < 3:
            await asyncio.sleep(0.01)
    finally:
        worker.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await worker

    spacings = [b - a for a, b in zip(client.calls, client.calls[1:])]
    assert all(s >= interval_ms / 1000 for s in spacings[1:])
