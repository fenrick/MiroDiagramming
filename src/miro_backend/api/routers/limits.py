"""Diagnostic endpoints for queue and rate limits."""

from __future__ import annotations

from fastapi import APIRouter, Depends, status
import logfire

from ...queue.change_queue import change_queue_length
from ...services.rate_limiter import RateLimiter, get_rate_limiter

router = APIRouter(prefix="/api", tags=["limits"])


@router.get("/limits", status_code=status.HTTP_200_OK)  # type: ignore[misc]
def get_limits(limiter: RateLimiter = Depends(get_rate_limiter)) -> dict[str, object]:
    """Return queue length and current bucket fill per user."""
    with logfire.span("get limits"):
        return {
            "queue_length": int(change_queue_length._value.get()),
            "bucket_fill": limiter.bucket_fill(),
        }
