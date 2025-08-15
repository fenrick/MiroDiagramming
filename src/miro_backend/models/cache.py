"""Database models for cached data."""

from typing import Any

from sqlalchemy import Integer, String, JSON
from sqlalchemy.orm import Mapped, mapped_column

from ..db.session import Base


class CacheEntry(Base):
    """Represents a simple key/value cache stored in the database."""

    __tablename__ = "cache_entries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    key: Mapped[str] = mapped_column(String, unique=True, index=True)
    value: Mapped[dict[str, Any]] = mapped_column(JSON)
