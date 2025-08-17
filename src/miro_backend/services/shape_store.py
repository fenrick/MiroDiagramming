"""Storage abstractions for shapes and board ownership."""

from __future__ import annotations

from threading import Lock
from typing import Protocol

from fastapi import Depends
from sqlalchemy.orm import Session

from ..db.session import get_session
from ..models import Board, Shape as ShapeModel
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
        self._session = session

    def add_board(self, board_id: str, owner_id: str) -> None:
        board = (
            self._session.query(Board).filter(Board.board_id == board_id).one_or_none()
        )
        if board is None:
            board = Board(board_id=board_id, owner_id=owner_id)
            self._session.add(board)
        else:
            board.owner_id = owner_id
        self._session.commit()

    def board_owner(self, board_id: str) -> str | None:
        board = (
            self._session.query(Board).filter(Board.board_id == board_id).one_or_none()
        )
        return board.owner_id if board else None

    def list(self, board_id: str) -> list[Shape]:
        records = (
            self._session.query(ShapeModel)
            .filter(ShapeModel.board_id == board_id)
            .all()
        )
        return [Shape(id=r.shape_id, **r.payload) for r in records]

    def get(self, board_id: str, shape_id: str) -> Shape | None:
        record = (
            self._session.query(ShapeModel)
            .filter(
                ShapeModel.board_id == board_id,
                ShapeModel.shape_id == shape_id,
            )
            .one_or_none()
        )
        if record is None:
            return None
        return Shape(id=record.shape_id, **record.payload)

    def create(self, board_id: str, shape: Shape) -> None:
        record = ShapeModel(
            board_id=board_id,
            shape_id=shape.id,
            payload=shape.model_dump(exclude={"id"}),
        )
        self._session.merge(record)
        self._session.commit()

    def update(self, board_id: str, shape: Shape) -> None:
        record = (
            self._session.query(ShapeModel)
            .filter(
                ShapeModel.board_id == board_id,
                ShapeModel.shape_id == shape.id,
            )
            .one_or_none()
        )
        if record is None:
            return
        record.payload = shape.model_dump(exclude={"id"})
        self._session.commit()

    def delete(self, board_id: str, shape_id: str) -> None:
        record = (
            self._session.query(ShapeModel)
            .filter(
                ShapeModel.board_id == board_id,
                ShapeModel.shape_id == shape_id,
            )
            .one_or_none()
        )
        if record is not None:
            self._session.delete(record)
            self._session.commit()


def get_shape_store(session: Session = Depends(get_session)) -> ShapeStore:
    """FastAPI dependency provider for :class:`ShapeStore`."""

    return DbShapeStore(session)
