"""Queue wrapper used for change task processing."""

from __future__ import annotations

import asyncio
import random
from typing import Any

from sqlalchemy.orm import Session

from ..services.miro_client import MiroClient
from ..services.token_service import get_valid_access_token

import logfire
from prometheus_client import Gauge

from .tasks import ChangeTask


# Prometheus gauge tracking queued change tasks. Registered in ``main`` to avoid
# reliance on the default registry and ensure exposure via ``/metrics``.
change_queue_length = Gauge(
    "change_queue_length",
    "Number of change tasks pending in the queue",
    registry=None,
)


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

    @property
    def persistence(self) -> Any | None:
        """Return the persistence layer used by this queue."""

        return self._persistence

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

        # Update metric after task enqueued
        change_queue_length.set(self._queue.qsize())

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
        # Update metric after removing task
        change_queue_length.set(self._queue.qsize())
        return task

    # ------------------------------------------------------------------
    # Worker utilities
    # ------------------------------------------------------------------
    @logfire.instrument("worker loop")  # type: ignore[misc]
    async def worker(self, session: Session, client: MiroClient) -> None:
        """Continuously consume tasks and apply them using ``client``."""

        while True:
            task = await self.dequeue()
            # Span around applying each individual task
            with logfire.span("apply task {task=}", task=task):
                token = await get_valid_access_token(session, task.user_id, client)
                for attempt in range(5):
                    try:
                        await task.apply(client, token)
                        break
                    except Exception as exc:  # noqa: BLE001 - re-raised after retries
                        status = getattr(exc, "status", None) or getattr(
                            exc, "status_code", None
                        )
                        if status not in {429} and not (
                            isinstance(status, int) and 500 <= status < 600
                        ):
                            raise
                        if attempt == 4:
                            logfire.error(
                                "task failed after retries", task=task, error=exc
                            )
                            raise
                        retry_after = getattr(exc, "retry_after", None)
                        delay = (
                            float(retry_after)
                            if retry_after is not None
                            else 2 ** (attempt + 1) + random.uniform(0, 1)
                        )
                        logfire.warning(
                            "retrying task",
                            attempt=attempt + 1,
                            delay=delay,
                            task=task,
                            error=exc,
                        )
                        await asyncio.sleep(delay)
