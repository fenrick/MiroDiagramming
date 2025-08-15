"""Database model for tags."""

from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db.session import Base

if TYPE_CHECKING:
    from .board import Board


class Tag(Base):
    """Represents a tag attached to a board."""

    __tablename__ = "tags"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    board_id: Mapped[int] = mapped_column(
        ForeignKey("boards.id", ondelete="CASCADE"), index=True
    )
    name: Mapped[str] = mapped_column(String, index=True)

    board: Mapped["Board"] = relationship("Board", back_populates="tags")
