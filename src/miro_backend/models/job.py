"""Database model for background jobs."""

from __future__ import annotations

from datetime import datetime
from uuid import UUID
from typing import Any

from sqlalchemy import DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import JSON

from ..db.session import Base


class Job(Base):
    """Represents a long-running background job."""

    __tablename__ = "jobs"

    id: Mapped[UUID] = mapped_column(String, primary_key=True)
    status: Mapped[str] = mapped_column(String, nullable=False)
    results: Mapped[dict[str, Any] | None] = mapped_column(JSON, default=None)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )
