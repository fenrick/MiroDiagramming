"""Repository abstractions for data access.

The repository pattern provides a thin layer over SQLAlchemy sessions,
centralising common CRUD operations and keeping persistence concerns out of
business logic.
"""

from __future__ import annotations

from collections.abc import Sequence
from typing import Generic, TypeVar

from sqlalchemy.orm import Session

ModelT = TypeVar("ModelT")


class Repository(Generic[ModelT]):
    """Generic repository for CRUD operations on a SQLAlchemy model."""

    def __init__(self, session: Session, model: type[ModelT]) -> None:
        self.session = session
        self.model = model

    # ------------------------------------------------------------------
    # Create / Update
    # ------------------------------------------------------------------
    def add(self, instance: ModelT) -> ModelT:
        """Persist ``instance`` to the database."""

        self.session.add(instance)
        self.session.commit()
        self.session.refresh(instance)
        return instance

    # ------------------------------------------------------------------
    # Read operations
    # ------------------------------------------------------------------
    def get(self, id_: int) -> ModelT | None:
        """Return an entity by primary key if present."""

        return self.session.get(self.model, id_)

    def list(self) -> Sequence[ModelT]:
        """Return all entities of the repository type."""

        return self.session.query(self.model).all()

    # ------------------------------------------------------------------
    # Delete operations
    # ------------------------------------------------------------------
    def delete(self, instance: ModelT) -> None:
        """Remove ``instance`` from the database."""

        self.session.delete(instance)
        self.session.commit()
