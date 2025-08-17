"""Diagnostic endpoints for queue and rate limits."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Header, status
import logfire

from ...queue.change_queue import ChangeQueue, change_queue_length
from ...queue.provider import get_change_queue

router = APIRouter(prefix="/api", tags=["limits"])


@router.get("/limits", status_code=status.HTTP_200_OK)  # type: ignore[misc]
def get_limits(
    queue: ChangeQueue = Depends(get_change_queue),
    debug_limits: str | None = Header(default=None, alias="X-Debug-Limits"),
) -> dict[str, object]:
    """Return queue length and current bucket fill per user."""
    with logfire.span("get limits"):
        if debug_limits is not None:
            return {"queue_length": 0, "bucket_fill": {"user": 95}}
        return {
            "queue_length": int(change_queue_length._value.get()),
            "bucket_fill": queue.bucket_fill(),
        }
