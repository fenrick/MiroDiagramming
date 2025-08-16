"""Queue wrapper used for change task processing."""

from __future__ import annotations

import asyncio
import random
from typing import Any

from sqlalchemy.orm import Session

from ..models import CacheEntry
from ..services.miro_client import MiroClient
from ..services.repository import Repository
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


async def _fetch_board_snapshot(
    client: MiroClient, board_id: str, token: str
) -> dict[str, Any]:
    """Return a snapshot for ``board_id``.

    The function is a stub and can be monkeypatched in tests until the
    full Miro API call is implemented.
    """

    del client, board_id, token
    return {}


class ChangeQueue:
    """A thin wrapper around :class:`asyncio.Queue` with persistence hooks."""

    def __init__(self, persistence: Any | None = None) -> None:
        self._queue: asyncio.Queue[ChangeTask] = asyncio.Queue()
        self._persistence = persistence
        self._lock = asyncio.Lock()
        self._refresh_tasks: dict[str, asyncio.Task[None]] = {}
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
        repo: Repository[CacheEntry] = Repository(session, CacheEntry)
        while True:
            task = await self.dequeue()
            # Span around applying each individual task
            with logfire.span("apply task {task=}", task=task):
                token = await get_valid_access_token(session, task.user_id, client)
                for attempt in range(5):
                    try:
                        await task.apply(client, token)
                        board_id = getattr(task, "board_id", None)
                        if board_id is not None:
                            self._debounced_refresh(board_id, client, repo, token)
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

    def _debounced_refresh(
        self,
        board_id: str,
        client: MiroClient,
        repo: Repository[CacheEntry],
        token: str,
    ) -> None:
        """Schedule a cache refresh for ``board_id`` after a short delay."""

        existing = self._refresh_tasks.get(board_id)
        if existing is not None:
            existing.cancel()
        self._refresh_tasks[board_id] = asyncio.create_task(
            self._refresh_board_state(board_id, client, repo, token)
        )

    async def _refresh_board_state(
        self,
        board_id: str,
        client: MiroClient,
        repo: Repository[CacheEntry],
        token: str,
    ) -> None:
        """Fetch a board snapshot and update the cache."""

        try:
            await asyncio.sleep(0.05)
            snapshot = await _fetch_board_snapshot(client, board_id, token)
            repo.set_board_state(board_id, snapshot)
        except asyncio.CancelledError:  # pragma: no cover - expected during debounce
            return
