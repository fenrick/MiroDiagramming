"""Tests for retryable HTTP errors in ChangeQueue worker."""

from __future__ import annotations

import asyncio
import contextlib

import pytest

from miro_backend.queue import ChangeQueue, CreateNode
from miro_backend.queue.change_queue import task_retries
from miro_backend.services.errors import HttpError


class ConflictOnceClient:
    """Client that raises a conflict once before succeeding."""

    def __init__(self) -> None:
        self.calls = 0

    async def create_node(
        self, node_id: str, data: dict[str, int], _token: str
    ) -> None:
        self.calls += 1
        if self.calls == 1:
            raise HttpError(409)


class BadRequestClient:
    """Client that always raises a bad request error."""

    def __init__(self) -> None:
        self.calls = 0

    async def create_node(
        self, node_id: str, data: dict[str, int], _token: str
    ) -> None:
        self.calls += 1
        raise HttpError(400)


@pytest.mark.asyncio()  # type: ignore[misc]
async def test_conflict_is_retried(monkeypatch: pytest.MonkeyPatch) -> None:
    """HTTP 409 errors should be retried."""

    queue = ChangeQueue()
    client = ConflictOnceClient()

    async def _token(*_: object) -> str:
        return "t"

    real_sleep = asyncio.sleep

    async def fake_sleep(_: float) -> None:
        await real_sleep(0)

    monkeypatch.setattr(
        "miro_backend.queue.change_queue.get_valid_access_token", _token
    )
    monkeypatch.setattr("miro_backend.queue.change_queue.asyncio.sleep", fake_sleep)
    monkeypatch.setattr(
        "miro_backend.queue.change_queue.random.uniform", lambda _a, _b: 0
    )

    task_retries.labels(type="CreateNode")._value.set(0)

    await queue.enqueue(CreateNode(node_id="n1", data={}, user_id="u1"))
    worker = asyncio.create_task(queue.worker(object(), client))
    try:
        while client.calls < 2:
            await real_sleep(0)
    finally:
        worker.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await worker

    assert client.calls == 2
    assert task_retries.labels(type="CreateNode")._value.get() == 1


@pytest.mark.asyncio()  # type: ignore[misc]
async def test_bad_request_not_retried(monkeypatch: pytest.MonkeyPatch) -> None:
    """HTTP 400 errors should not be retried."""

    queue = ChangeQueue()
    client = BadRequestClient()

    async def _token(*_: object) -> str:
        return "t"

    monkeypatch.setattr(
        "miro_backend.queue.change_queue.get_valid_access_token", _token
    )

    task_retries.labels(type="CreateNode")._value.set(0)

    await queue.enqueue(CreateNode(node_id="n1", data={}, user_id="u1"))
    worker = asyncio.create_task(queue.worker(object(), client))
    with pytest.raises(HttpError):
        await worker

    assert client.calls == 1
    assert task_retries.labels(type="CreateNode")._value.get() == 0
