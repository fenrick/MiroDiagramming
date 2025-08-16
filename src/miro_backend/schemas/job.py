"""Pydantic models for job inspection endpoints."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel


class JobResult(BaseModel):
    """Outcome of an individual operation within a job."""

    index: int
    status: Literal["succeeded", "failed"]
    error: str | None = None


class JobStatusResponse(BaseModel):
    """Aggregated status and results for a submitted job."""

    job_id: str
    status: Literal["queued", "running", "succeeded", "failed"]
    results: list[JobResult]
