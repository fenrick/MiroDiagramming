"""Database model for background jobs."""

from __future__ import annotations

from datetime import datetime
from enum import StrEnum
from typing import Any
from uuid import uuid4

from sqlalchemy import DateTime, JSON, Enum as SAEnum, String
from sqlalchemy.orm import Mapped, mapped_column

from ..db.session import Base


class JobStatus(StrEnum):
    """Possible states for a background job."""

    QUEUED = "queued"
    RUNNING = "running"
    SUCCEEDED = "succeeded"
    FAILED = "failed"


class Job(Base):
    """Track long-running background jobs and their results."""

    __tablename__ = "jobs"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid4())
    )
    status: Mapped[JobStatus] = mapped_column(
        SAEnum(JobStatus, native_enum=False), default=JobStatus.QUEUED
    )
    results: Mapped[dict[str, Any] | None] = mapped_column(
        JSON, default=None, nullable=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )
