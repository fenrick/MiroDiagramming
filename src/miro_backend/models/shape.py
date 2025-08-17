"""Database model for shapes stored on boards."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, func, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import TYPE_CHECKING

from ..db.session import Base

if TYPE_CHECKING:
    from .board import Board


class Shape(Base):
    """Represents a shape persisted in the local database."""

    __tablename__ = "shapes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    board_id: Mapped[str] = mapped_column(
        ForeignKey("boards.board_id", ondelete="CASCADE"), index=True
    )
    shape_id: Mapped[str] = mapped_column(String, unique=True, index=True)
    payload: Mapped[dict[str, object]] = mapped_column(JSON)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    board: Mapped["Board"] = relationship("Board", back_populates="shapes")
