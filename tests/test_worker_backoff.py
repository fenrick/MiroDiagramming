"""Test the worker's handling of retry-after backoff."""

from __future__ import annotations

import asyncio
import contextlib

import httpx
import pytest

from miro_backend.queue import ChangeQueue, CreateNode
from miro_backend.services.errors import HttpError, RateLimitedError


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
            raise RateLimitedError(retry_after=self._retry_after)
        self.created.append((node_id, data))


class UnstableClient:
    """Client that returns a transient server error before succeeding."""

    def __init__(self) -> None:
        self.calls = 0
        self.created: list[tuple[str, dict[str, int]]] = []

    async def create_node(
        self, node_id: str, data: dict[str, int], _token: str
    ) -> None:
        self.calls += 1
        if self.calls < 3:
            raise HttpError(503)
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


@pytest.mark.asyncio()  # type: ignore[misc]
async def test_worker_retries_on_transient_server_error(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    queue = ChangeQueue()
    client = UnstableClient()
    delays: list[float] = []

    async def _token(*_: object) -> str:
        return "t"

    real_sleep = asyncio.sleep

    async def fake_sleep(delay: float) -> None:
        if delay:
            delays.append(delay)
        await real_sleep(0)

    monkeypatch.setattr(
        "miro_backend.queue.change_queue.get_valid_access_token", _token
    )
    monkeypatch.setattr("miro_backend.queue.change_queue.asyncio.sleep", fake_sleep)
    monkeypatch.setattr(
        "miro_backend.queue.change_queue.random.uniform", lambda _a, _b: 0
    )

    worker = asyncio.create_task(queue.worker(object(), client))
    try:
        await queue.enqueue(CreateNode(node_id="n1", data={"x": 1}, user_id="u1"))
        while not client.created:
            await real_sleep(0)
    finally:
        worker.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await worker

    assert client.created == [("n1", {"x": 1})]
    assert client.calls == 3
    assert delays == [2, 4]


class NetworkFlakyClient:
    """Client that fails with network errors before succeeding."""

    def __init__(self) -> None:
        self.calls = 0
        self.created: list[tuple[str, dict[str, int]]] = []

    async def create_node(
        self, node_id: str, data: dict[str, int], _token: str
    ) -> None:
        self.calls += 1
        if self.calls < 3:
            raise httpx.ReadTimeout("boom")
        self.created.append((node_id, data))


@pytest.mark.asyncio()  # type: ignore[misc]
async def test_worker_retries_on_network_error(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    queue = ChangeQueue()
    client = NetworkFlakyClient()
    delays: list[float] = []

    async def _token(*_: object) -> str:
        return "t"

    real_sleep = asyncio.sleep

    async def fake_sleep(delay: float) -> None:
        if delay:
            delays.append(delay)
        await real_sleep(0)

    monkeypatch.setattr(
        "miro_backend.queue.change_queue.get_valid_access_token", _token
    )
    monkeypatch.setattr("miro_backend.queue.change_queue.asyncio.sleep", fake_sleep)
    monkeypatch.setattr(
        "miro_backend.queue.change_queue.random.uniform", lambda _a, _b: 0
    )

    worker = asyncio.create_task(queue.worker(object(), client))
    try:
        await queue.enqueue(CreateNode(node_id="n1", data={"x": 1}, user_id="u1"))
        while not client.created:
            await real_sleep(0)
    finally:
        worker.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await worker

    assert client.created == [("n1", {"x": 1})]
    assert client.calls == 3
    assert delays == [2, 4]
