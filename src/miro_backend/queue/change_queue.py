"""Queue wrapper used for change task processing."""

from __future__ import annotations

import asyncio
from typing import Any

import logfire

from .tasks import ChangeTask


class ChangeQueue:
    """A thin wrapper around :class:`asyncio.Queue` with persistence hooks."""

    def __init__(self, persistence: Any | None = None) -> None:
        self._queue: asyncio.Queue[ChangeTask] = asyncio.Queue()
        self._persistence = persistence
        self._lock = asyncio.Lock()
        if self._persistence is not None:
            for task in self._persistence.load():
                # Record loading of persisted tasks on startup
                logfire.info("loaded persisted task", task=task)
                self._queue.put_nowait(task)

    @logfire.instrument("enqueue task {task=}")  # type: ignore[misc]
    async def enqueue(self, task: ChangeTask) -> None:
        """Add ``task`` to the queue and persist it if supported."""

        if self._persistence is not None:
            # Persist task then enqueue so it survives restarts
            async with self._lock:
                logfire.info("persisting task", task=task)
                await self._persistence.save(task)
                await self._queue.put(task)
        else:
            # Queue task without persistence
            logfire.info("enqueue without persistence", task=task)
            await self._queue.put(task)

    @logfire.instrument("dequeue task")  # type: ignore[misc]
    async def dequeue(self) -> ChangeTask:
        """Retrieve the next task from the queue and remove persisted state."""

        task = await self._queue.get()
        logfire.info("task dequeued", task=task)
        if self._persistence is not None:
            # Remove task from persistence after dequeue
            async with self._lock:
                logfire.info("removing task from persistence", task=task)
                await self._persistence.delete(task)
        return task

    # ------------------------------------------------------------------
    # Worker utilities
    # ------------------------------------------------------------------
    @logfire.instrument("worker loop")  # type: ignore[misc]
    async def worker(self, client: Any) -> None:
        """Continuously consume tasks and apply them using ``client``."""

        while True:
            task = await self.dequeue()
            # Span around applying each individual task
            with logfire.span("apply task {task=}", task=task):
                await task.apply(client)
