"""Dependency helpers for the global :class:`ChangeQueue`."""

from __future__ import annotations

from .change_queue import ChangeQueue

_change_queue = ChangeQueue()


def get_change_queue() -> ChangeQueue:
    """Return the shared :class:`ChangeQueue` instance."""
    return _change_queue
