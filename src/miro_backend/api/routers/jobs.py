"""HTTP routes for job status queries."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ...db.session import get_session
from ...models import Job as JobModel
from ...schemas.job import Job as JobSchema
from ...services.repository import Repository

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


@router.get("/{job_id}", response_model=JobSchema)  # type: ignore[misc]
def get_job(job_id: str, session: Session = Depends(get_session)) -> JobSchema:
    """Return the job with ``job_id`` if present."""

    repo: Repository[JobModel] = Repository(session, JobModel)
    job = repo.get(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return JobSchema.model_validate(job)
