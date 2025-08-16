"""Test the worker's handling of retry-after backoff."""

from __future__ import annotations

import asyncio
import contextlib

import pytest

from miro_backend.queue import ChangeQueue, CreateNode


class RetryAfterError(Exception):
    """Error carrying ``retry_after`` and ``status`` for backoff."""

    def __init__(self, retry_after: float) -> None:
        super().__init__("retry later")
        self.status = 429
        self.retry_after = retry_after


class FlakyClient:
    """Client that fails twice before succeeding."""

    def __init__(self, retry_after: float) -> None:
        self._retry_after = retry_after
        self.calls = 0
        self.created: list[tuple[str, dict[str, int]]] = []

    async def create_node(
        self, node_id: str, data: dict[str, int], _token: str
    ) -> None:
        self.calls += 1
        if self.calls < 3:
            raise RetryAfterError(self._retry_after)
        self.created.append((node_id, data))


@pytest.mark.asyncio()  # type: ignore[misc]
async def test_worker_respects_retry_after_backoff(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    queue = ChangeQueue()
    retry_delay = 0.1
    client = FlakyClient(retry_delay)

    async def _token(*_: object) -> str:
        return "t"

    monkeypatch.setattr(
        "miro_backend.queue.change_queue.get_valid_access_token", _token
    )

    worker = asyncio.create_task(queue.worker(object(), client))
    try:
        await queue.enqueue(CreateNode(node_id="n1", data={"x": 1}, user_id="u1"))
        loop = asyncio.get_running_loop()
        start = loop.time()
        while not client.created:
            await asyncio.sleep(0.01)
        duration = loop.time() - start
    finally:
        worker.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await worker

    assert client.created == [("n1", {"x": 1})]
    assert client.calls == 3
    assert duration >= retry_delay * 2
    assert duration < 1
