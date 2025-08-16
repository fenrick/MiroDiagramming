import asyncio
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

import httpx
import pytest
import pytest_asyncio
from fastapi import FastAPI

from miro_backend.main import app
from miro_backend.queue import provider as queue_provider


class DummyQueue:
    """Queue implementation that records enqueued tasks."""

    def __init__(self) -> None:
        self.tasks: list[object] = []

    async def enqueue(self, task: object) -> None:
        self.tasks.append(task)

    async def worker(
        self, _session: object, _client: object
    ) -> None:  # pragma: no cover - never returns
        await asyncio.Event().wait()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Run startup and shutdown events for ``app``."""

    async with app.router.lifespan_context(app):
        yield


# ``pytest_asyncio`` is untyped; ignore to keep fixtures checked.
@pytest_asyncio.fixture  # type: ignore[misc]
async def client_queue(
    monkeypatch: pytest.MonkeyPatch,
) -> AsyncIterator[tuple[httpx.AsyncClient, DummyQueue]]:
    """Yield an ``AsyncClient`` connected to the app and the dummy queue."""

    queue = DummyQueue()
    # Replace the global queue used by the app and dependency provider
    monkeypatch.setattr(queue_provider, "_change_queue", queue, raising=False)
    monkeypatch.setattr("miro_backend.main.change_queue", queue, raising=False)

    async with lifespan(app):
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(
            transport=transport, base_url="http://test"
        ) as client:
            yield client, queue
