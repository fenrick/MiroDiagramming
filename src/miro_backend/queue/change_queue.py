"""Queue wrapper used for change task processing."""

from __future__ import annotations

import asyncio
from typing import Any

from .tasks import ChangeTask


class ChangeQueue:
    """A thin wrapper around :class:`asyncio.Queue` with persistence hooks."""

    def __init__(self, persistence: Any | None = None) -> None:
        self._queue: asyncio.Queue[ChangeTask] = asyncio.Queue()
        self._persistence = persistence
        self._lock = asyncio.Lock()
        if self._persistence is not None:
            for task in self._persistence.load():
                self._queue.put_nowait(task)

    async def enqueue(self, task: ChangeTask) -> None:
        """Add ``task`` to the queue and persist it if supported."""

        if self._persistence is not None:
            async with self._lock:
                await self._persistence.save(task)
                await self._queue.put(task)
        else:
            await self._queue.put(task)

    async def dequeue(self) -> ChangeTask:
        """Retrieve the next task from the queue and remove persisted state."""

        task = await self._queue.get()
        if self._persistence is not None:
            async with self._lock:
                await self._persistence.delete(task)
        return task

    # ------------------------------------------------------------------
    # Worker utilities
    # ------------------------------------------------------------------
    async def worker(self, client: Any) -> None:
        """Continuously consume tasks and apply them using ``client``."""

        while True:
            task = await self.dequeue()
            await task.apply(client)
