"""Dependency helpers for the global :class:`ChangeQueue`."""

from __future__ import annotations

from .change_queue import ChangeQueue
from .persistence import SqlAlchemyQueuePersistence
from ..core.config import settings

_change_queue = ChangeQueue(
    persistence=SqlAlchemyQueuePersistence(),
    bucket_reservoir=settings.bucket_reservoir,
    bucket_refresh_interval_ms=settings.bucket_refresh_ms,
)


def get_change_queue() -> ChangeQueue:
    """Return the shared :class:`ChangeQueue` instance."""
    return _change_queue
