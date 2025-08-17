"""Database model for shapes."""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, Any

from sqlalchemy import DateTime, ForeignKey, String, JSON, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db.session import Base

if TYPE_CHECKING:
    from .board import Board


class Shape(Base):
    """Represents a shape stored on a board."""

    __tablename__ = "shapes"

    board_id: Mapped[str] = mapped_column(
        String, ForeignKey("boards.board_id", ondelete="CASCADE"), primary_key=True
    )
    shape_id: Mapped[str] = mapped_column(String, primary_key=True)
    payload: Mapped[dict[str, Any]] = mapped_column(JSON)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    board: Mapped["Board"] = relationship("Board", back_populates="shapes")
