"""Storage abstractions for shapes and board ownership."""

from __future__ import annotations

from threading import Lock
from typing import Protocol

from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db.session import get_session
from ..models.board import Board
from ..models.shape import Shape as ShapeModel
from ..schemas.shape import Shape


class ShapeStore(Protocol):
    """Persist and retrieve shapes for boards."""

    def add_board(self, board_id: str, owner_id: str) -> None:
        """Register a board owned by ``owner_id``."""

    def board_owner(self, board_id: str) -> str | None:
        """Return the owner for ``board_id`` if known."""

    def list(self, board_id: str) -> list[Shape]:
        """Return all shapes for ``board_id``."""

    def get(self, board_id: str, shape_id: str) -> Shape | None:
        """Retrieve a single shape by ``shape_id``."""

    def create(self, board_id: str, shape: Shape) -> None:
        """Persist ``shape`` under ``board_id``."""

    def update(self, board_id: str, shape: Shape) -> None:
        """Replace an existing shape with ``shape``."""

    def delete(self, board_id: str, shape_id: str) -> None:
        """Remove the shape identified by ``shape_id``."""


class InMemoryShapeStore(ShapeStore):
    """Thread-safe in-memory implementation of :class:`ShapeStore`."""

    def __init__(self) -> None:
        self._owners: dict[str, str] = {}
        self._boards: dict[str, dict[str, Shape]] = {}
        self._lock = Lock()

    def add_board(self, board_id: str, owner_id: str) -> None:
        with self._lock:
            self._owners[board_id] = owner_id
            self._boards.setdefault(board_id, {})

    def board_owner(self, board_id: str) -> str | None:
        with self._lock:
            return self._owners.get(board_id)

    def list(self, board_id: str) -> list[Shape]:
        with self._lock:
            return list(self._boards.get(board_id, {}).values())

    def get(self, board_id: str, shape_id: str) -> Shape | None:
        with self._lock:
            return self._boards.get(board_id, {}).get(shape_id)

    def create(self, board_id: str, shape: Shape) -> None:
        with self._lock:
            self._boards.setdefault(board_id, {})[shape.id] = shape

    def update(self, board_id: str, shape: Shape) -> None:
        with self._lock:
            if board_id in self._boards and shape.id in self._boards[board_id]:
                self._boards[board_id][shape.id] = shape

    def delete(self, board_id: str, shape_id: str) -> None:
        with self._lock:
            if board_id in self._boards:
                self._boards[board_id].pop(shape_id, None)


class DbShapeStore(ShapeStore):
    """Database-backed implementation of :class:`ShapeStore`."""

    def __init__(self, session: Session) -> None:
        self.session = session

    def add_board(self, board_id: str, owner_id: str) -> None:
        board = self.session.scalar(select(Board).where(Board.board_id == board_id))
        if board is None:
            board = Board(board_id=board_id, owner_id=owner_id)
            self.session.add(board)
        else:
            board.owner_id = owner_id
        self.session.commit()

    def board_owner(self, board_id: str) -> str | None:
        board = self.session.scalar(
            select(Board.owner_id).where(Board.board_id == board_id)
        )
        return board

    def list(self, board_id: str) -> list[Shape]:
        rows = self.session.scalars(
            select(ShapeModel).where(ShapeModel.board_id == board_id)
        ).all()
        return [Shape.model_validate(row.payload) for row in rows]

    def get(self, board_id: str, shape_id: str) -> Shape | None:
        row = self.session.scalar(
            select(ShapeModel).where(
                ShapeModel.board_id == board_id,
                ShapeModel.shape_id == shape_id,
            )
        )
        return Shape.model_validate(row.payload) if row else None

    def create(self, board_id: str, shape: Shape) -> None:
        model = ShapeModel(
            board_id=board_id, shape_id=shape.id, payload=shape.model_dump()
        )
        self.session.add(model)
        self.session.commit()

    def update(self, board_id: str, shape: Shape) -> None:
        row = self.session.scalar(
            select(ShapeModel).where(
                ShapeModel.board_id == board_id,
                ShapeModel.shape_id == shape.id,
            )
        )
        if row:
            row.payload = shape.model_dump()
            self.session.commit()

    def delete(self, board_id: str, shape_id: str) -> None:
        row = self.session.scalar(
            select(ShapeModel).where(
                ShapeModel.board_id == board_id,
                ShapeModel.shape_id == shape_id,
            )
        )
        if row:
            self.session.delete(row)
            self.session.commit()


def get_shape_store(session: Session = Depends(get_session)) -> ShapeStore:
    """FastAPI dependency provider for :class:`ShapeStore`."""

    return DbShapeStore(session)
