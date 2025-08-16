"""Endpoints for inspecting batch job outcomes."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status

from ...queue.change_queue import ChangeQueue
from ...queue.provider import get_change_queue
from ...schemas.job import JobStatusResponse

router = APIRouter(prefix="/api", tags=["jobs"])


@router.get("/jobs/{job_id}", response_model=JobStatusResponse, status_code=status.HTTP_200_OK)  # type: ignore[misc]
async def get_job_status(
    job_id: str, queue: ChangeQueue = Depends(get_change_queue)
) -> JobStatusResponse:
    """Return the persisted status and results for ``job_id``."""

    if queue.persistence is None or not hasattr(queue.persistence, "get_job"):
        raise HTTPException(status_code=404, detail="job not found")
    job = await queue.persistence.get_job(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="job not found")
    return JobStatusResponse.model_validate(job)
