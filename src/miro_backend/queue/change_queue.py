"""Queue wrapper used for change task processing."""

from __future__ import annotations

import asyncio
import random
from typing import Any

from sqlalchemy.orm import Session

from ..services.miro_client import MiroClient
from ..services.token_service import get_valid_access_token
from ..models import CacheEntry, Job
from ..services.repository import Repository

import logfire
from prometheus_client import Gauge

from .tasks import ChangeTask


# ---------------------------------------------------------------------------
# Rate limiting utilities
# ---------------------------------------------------------------------------


class _TokenBucket:
    """Simple token bucket for soft per-user rate limiting."""

    def __init__(self, reservoir: int, refresh_interval_ms: int) -> None:
        self._reservoir = reservoir
        self._interval = refresh_interval_ms / 1000 if refresh_interval_ms > 0 else 0
        self._tokens = reservoir
        self._last = asyncio.get_running_loop().time()
        self._lock = asyncio.Lock()

    async def acquire(self) -> None:
        """Wait until a token is available and consume it."""

        if self._interval == 0:
            return
        while True:
            async with self._lock:
                now = asyncio.get_running_loop().time()
                elapsed = now - self._last
                if elapsed >= self._interval:
                    refill = int(elapsed / self._interval)
                    self._tokens = min(self._reservoir, self._tokens + refill)
                    self._last = now
                if self._tokens > 0:
                    self._tokens -= 1
                    return
                wait = self._interval - elapsed
            await asyncio.sleep(wait)


# Prometheus gauge tracking queued change tasks. Registered in ``main`` to avoid
# reliance on the default registry and ensure exposure via ``/metrics``.
change_queue_length = Gauge(
    "change_queue_length",
    "Number of change tasks pending in the queue",
    registry=None,
)


class ChangeQueue:
    """A thin wrapper around :class:`asyncio.Queue` with persistence hooks."""

    def __init__(
        self,
        persistence: Any | None = None,
        *,
        bucket_reservoir: int = 1,
        bucket_refresh_interval_ms: int = 0,
        refresh_debounce_ms: int = 500,
    ) -> None:
        self._queue: asyncio.Queue[ChangeTask] = asyncio.Queue()
        self._persistence = persistence
        self._lock = asyncio.Lock()
        self._bucket_reservoir = bucket_reservoir
        self._bucket_interval_ms = bucket_refresh_interval_ms
        self._buckets: dict[str, _TokenBucket] = {}
        self._refresh_delay = refresh_debounce_ms / 1000
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

    def bucket_fill(self) -> dict[str, int]:
        """Return remaining tokens per user."""

        return {user: bucket._tokens for user, bucket in self._buckets.items()}

    # ------------------------------------------------------------------
    # Cache refresh utilities
    # ------------------------------------------------------------------
    def _schedule_refresh(
        self,
        board_id: str,
        session: Session,
        client: MiroClient,
        token: str,
    ) -> None:
        existing = self._refresh_tasks.get(board_id)
        if existing is not None:
            existing.cancel()
        self._refresh_tasks[board_id] = asyncio.create_task(
            self._refresh_board_cache(board_id, session, client, token)
        )

    async def _refresh_board_cache(
        self,
        board_id: str,
        session: Session,
        client: MiroClient,
        token: str,
    ) -> None:
        try:
            await asyncio.sleep(self._refresh_delay)
            snapshot = await client.get_board(board_id, token)  # type: ignore[attr-defined]
            repo: Repository[CacheEntry] = Repository(session, CacheEntry)
            repo.set_board_state(board_id, snapshot)
        except asyncio.CancelledError:
            pass

    # ------------------------------------------------------------------
    # Worker utilities
    # ------------------------------------------------------------------
    @logfire.instrument("worker loop")  # type: ignore[misc]
    async def worker(self, session: Session, client: MiroClient) -> None:
        """Continuously consume tasks and apply them using ``client``."""

        while True:
            task = await self.dequeue()
            bucket = self._buckets.setdefault(
                task.user_id,
                _TokenBucket(self._bucket_reservoir, self._bucket_interval_ms),
            )
            job_repo: Repository[Job] | None = None
            job: Job | None = None
            if task.job_id is not None:
                job_repo = Repository(session, Job)
                job = job_repo.get(task.job_id)
                if job is not None and job.status == "queued":
                    job.status = "running"
                    session.commit()
            # Span around applying each individual task
            with logfire.span("apply task {task=}", task=task):
                token = await get_valid_access_token(session, task.user_id, client)
                succeeded = False
                for attempt in range(5):
                    await bucket.acquire()
                    try:
                        await task.apply(client, token)
                        succeeded = True
                        if job is not None:
                            results = job.results or {
                                "total": 0,
                                "operations": [],
                            }
                            results["operations"].append({"status": "succeeded"})
                            job.results = results
                            if len(results["operations"]) >= results.get("total", 0):
                                job.status = "succeeded"
                            session.commit()
                        break
                    except Exception as exc:  # noqa: BLE001 - re-raised after retries
                        status = getattr(exc, "status", None) or getattr(
                            exc, "status_code", None
                        )
                        retryable = status in {429} or (
                            isinstance(status, int) and 500 <= status < 600
                        )
                        if not retryable or attempt == 4:
                            if job is not None:
                                results = job.results or {
                                    "total": 0,
                                    "operations": [],
                                }
                                results["operations"].append(
                                    {"status": "failed", "error": str(exc)}
                                )
                                job.results = results
                                job.status = "failed"
                                session.commit()
                            if retryable and attempt == 4:
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
                if succeeded:
                    board_id = getattr(task, "board_id", None)
                    if board_id is not None:
                        self._schedule_refresh(board_id, session, client, token)
