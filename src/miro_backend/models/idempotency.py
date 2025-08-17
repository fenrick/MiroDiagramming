"""Database model for idempotent responses."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from sqlalchemy import DateTime, JSON, String
from sqlalchemy.orm import Mapped, mapped_column

from ..db.session import Base


class Idempotency(Base):
    """Persisted idempotent API responses keyed by a client-provided token."""

    __tablename__ = "idempotency"

    key: Mapped[str] = mapped_column(String, primary_key=True)
    response: Mapped[dict[str, Any]] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
