"""Batch operations endpoint."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Header, status
import logfire

from ...queue.change_queue import ChangeQueue
from ...queue.provider import get_change_queue
from ...schemas.batch import BatchRequest, BatchResponse
from ...services.batch_service import enqueue_operations

router = APIRouter(prefix="/api", tags=["batch"])

# Simple in-memory cache for idempotent responses
_IDEMPOTENCY_CACHE: dict[str, BatchResponse] = {}


@router.post("/batch", status_code=status.HTTP_202_ACCEPTED, response_model=BatchResponse)  # type: ignore[misc]
async def post_batch(
    request: BatchRequest,
    queue: ChangeQueue = Depends(get_change_queue),
    idempotency_key: str | None = Header(default=None, alias="Idempotency-Key"),
) -> BatchResponse:
    """Validate ``request`` and enqueue its operations.

    If ``idempotency_key`` is provided and the request was previously processed,
    return the cached response without enqueuing tasks again.
    """

    if idempotency_key is not None and idempotency_key in _IDEMPOTENCY_CACHE:
        return _IDEMPOTENCY_CACHE[idempotency_key]

    with logfire.span("post batch"):
        if idempotency_key and queue.persistence is not None:
            existing = await queue.persistence.get_response(idempotency_key)
            if existing is not None:
                return BatchResponse.model_validate(existing)

        count = await enqueue_operations(request.operations, queue)
        response = BatchResponse(enqueued=count)
        logfire.info("batch operations enqueued", count=count)  # event after enqueuing
        if idempotency_key is not None:
            _IDEMPOTENCY_CACHE[idempotency_key] = response
            
        response = BatchResponse(enqueued=count)

        if idempotency_key and queue.persistence is not None:
            await queue.persistence.save_response(
                idempotency_key, response.model_dump()
            )
            
        return response
