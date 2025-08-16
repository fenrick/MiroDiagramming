"""Simple in-memory token bucket limiter state."""

from __future__ import annotations

from threading import Lock


class RateLimiter:
    """Track token bucket fill per user."""

    def __init__(self) -> None:
        self._buckets: dict[str, int] = {}
        self._lock = Lock()

    def bucket_fill(self) -> dict[str, int]:
        """Return current bucket fill per user."""
        with self._lock:
            return dict(self._buckets)


_limiter = RateLimiter()


def get_rate_limiter() -> RateLimiter:
    """Provide the shared :class:`RateLimiter` instance."""
    return _limiter
