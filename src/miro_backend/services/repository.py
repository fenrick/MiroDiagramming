"""Repository abstractions for data access.

The repository pattern provides a thin layer over SQLAlchemy sessions,
centralising common CRUD operations and keeping persistence concerns out of
business logic.
"""

from __future__ import annotations

from collections.abc import Sequence
from datetime import datetime
from typing import Any, Generic, TypeVar

import logfire
from sqlalchemy.orm import Session

from ..models import CacheEntry

ModelT = TypeVar("ModelT")


class Repository(Generic[ModelT]):
    """Generic repository for CRUD operations on a SQLAlchemy model."""

    def __init__(self, session: Session, model: type[ModelT]) -> None:
        self.session = session
        self.model = model

    # ------------------------------------------------------------------
    # Create / Update
    # ------------------------------------------------------------------
    @logfire.instrument("add model")  # type: ignore[misc]
    def add(self, instance: ModelT) -> ModelT:
        """Persist ``instance`` to the database."""

        self.session.add(instance)
        self.session.commit()
        self.session.refresh(instance)
        logfire.info(
            "instance persisted", model=self.model.__name__
        )  # event: commit persisted entity
        return instance

    # ------------------------------------------------------------------
    # Read operations
    # ------------------------------------------------------------------
    @logfire.instrument("get model")  # type: ignore[misc]
    def get(self, id_: Any) -> ModelT | None:
        """Return an entity by primary key if present."""

        result = self.session.get(self.model, id_)
        logfire.info("entity retrieved", id=id_)  # event: retrieval
        return result

    @logfire.instrument("list models")  # type: ignore[misc]
    def list(self) -> Sequence[ModelT]:
        """Return all entities of the repository type."""

        results = self.session.query(self.model).all()
        logfire.info("entities listed", count=len(results))  # event: query complete
        return results

    @logfire.instrument("get board state")  # type: ignore[misc]
    def get_board_state(self, board_id: str) -> dict[str, Any] | None:
        """Return cached board state for ``board_id`` if present."""

        entry = self.session.query(CacheEntry).filter_by(key=board_id).one_or_none()
        logfire.info("board state fetched", board_id=board_id)  # event: cache lookup
        return entry.value if entry else None

    @logfire.instrument("set board state")  # type: ignore[misc]
    def set_board_state(self, board_id: str, snapshot: dict[str, Any]) -> None:
        """Store ``snapshot`` as the cached state for ``board_id``."""

        entry = self.session.query(CacheEntry).filter_by(key=board_id).one_or_none()
        now = datetime.utcnow()
        if entry is None:
            entry = CacheEntry(key=board_id, value=snapshot, created_at=now)
            self.session.add(entry)
        else:
            entry.value = snapshot
            entry.created_at = now
        self.session.commit()
        logfire.info("board state updated", board_id=board_id)

    # ------------------------------------------------------------------
    # Delete operations
    # ------------------------------------------------------------------
    @logfire.instrument("delete model")  # type: ignore[misc]
    def delete(self, instance: ModelT) -> None:
        """Remove ``instance`` from the database."""

        self.session.delete(instance)
        self.session.commit()
        logfire.info("instance removed", model=self.model.__name__)  # event: deletion
