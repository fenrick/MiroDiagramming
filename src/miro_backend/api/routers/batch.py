"""Batch operations endpoint."""

from __future__ import annotations

from fastapi import APIRouter, Depends, status

from ...queue.change_queue import ChangeQueue
from ...queue.provider import get_change_queue
from ...schemas.batch import BatchRequest, BatchResponse
from ...services.batch_service import enqueue_operations

router = APIRouter(prefix="/api", tags=["batch"])


@router.post("/batch", status_code=status.HTTP_202_ACCEPTED, response_model=BatchResponse)  # type: ignore[misc]
async def post_batch(
    request: BatchRequest, queue: ChangeQueue = Depends(get_change_queue)
) -> BatchResponse:
    """Validate ``request`` and enqueue its operations."""

    count = await enqueue_operations(request.operations, queue)
    return BatchResponse(enqueued=count)
