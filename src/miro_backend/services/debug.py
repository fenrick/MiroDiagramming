"""Developer debug toggles for test scenarios."""

from __future__ import annotations

from threading import Lock

_counter = 0
_lock = Lock()


def set_debug_429(count: int) -> None:
    """Set the number of upcoming requests to fail with HTTP 429."""
    global _counter
    with _lock:
        _counter = count


def consume_debug_429() -> bool:
    """Return ``True`` if a debug 429 should be returned for this request."""
    global _counter
    with _lock:
        if _counter > 0:
            _counter -= 1
            return True
        return False
