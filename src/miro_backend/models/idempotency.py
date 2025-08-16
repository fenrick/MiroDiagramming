"""Database model for idempotent responses."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from sqlalchemy import DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.types import JSON

from ..db.session import Base


class Idempotency(Base):
    """Caches HTTP responses for an idempotency key."""

    __tablename__ = "idempotency"

    key: Mapped[str] = mapped_column(String, primary_key=True)
    response: Mapped[dict[str, Any]] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
