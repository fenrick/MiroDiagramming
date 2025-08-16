"""Reusable HTTP error types."""

from __future__ import annotations


class HttpError(Exception):
    """Exception representing an HTTP response failure.

    Parameters
    ----------
    status:
        HTTP status code from the response.
    retry_after:
        Optional number of seconds to wait before retrying.
    message:
        Optional error message.
    """

    def __init__(
        self,
        status: int,
        message: str | None = None,
        *,
        retry_after: float | None = None,
    ) -> None:
        super().__init__(message or f"HTTP {status}")
        self.status = status
        self.status_code = status
        self.retry_after = retry_after


class RateLimitedError(HttpError):
    """HTTP 429 response with optional retry-after delay."""

    def __init__(
        self, *, retry_after: float | None = None, message: str | None = None
    ) -> None:
        super().__init__(429, message or "rate limited", retry_after=retry_after)
