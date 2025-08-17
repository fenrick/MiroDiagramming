"""Database model for boards."""

from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db.session import Base

if TYPE_CHECKING:
    from .shape import Shape
    from .tag import Tag


class Board(Base):
    """Represents a board in the local database."""

    __tablename__ = "boards"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    board_id: Mapped[str] = mapped_column(String, unique=True, index=True)
    owner_id: Mapped[str] = mapped_column(String, index=True)
    name: Mapped[str | None] = mapped_column(
        String, unique=True, index=True, nullable=True
    )

    tags: Mapped[list["Tag"]] = relationship(
        "Tag", back_populates="board", cascade="all, delete-orphan"
    )
    shapes: Mapped[list["Shape"]] = relationship(
        "Shape", back_populates="board", cascade="all, delete-orphan"
    )
