"""Job status endpoints."""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...db.session import get_session
from ...models.job import Job as JobModel
from ...schemas.job import JobRead
from ...services.repository import Repository

router = APIRouter(prefix="/api", tags=["jobs"])


@router.get("/jobs/{job_id}", response_model=JobRead)  # type: ignore[misc]
def get_job(job_id: UUID, session: Session = Depends(get_session)) -> JobRead:
    """Return the persisted job with ``job_id`` or 404 if missing."""

    repo: Repository[JobModel] = Repository(session, JobModel)
    job = repo.get(str(job_id))
    if job is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="not found")
    return JobRead.model_validate(job, from_attributes=True)
