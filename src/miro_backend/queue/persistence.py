"""Persistence layer for change queue using SQLAlchemy."""

from __future__ import annotations

import asyncio
from typing import Any, Type

from sqlalchemy import Integer, String, Text, select
from sqlalchemy.orm import Mapped, mapped_column

from ..db.session import Base, SessionLocal, engine
from ..models.idempotency import Idempotency
from .tasks import (
    ChangeTask,
    CreateNode,
    CreateShape,
    DeleteShape,
    UpdateCard,
    UpdateShape,
)

_TASK_TYPES: dict[str, Type[ChangeTask]] = {
    "CreateNode": CreateNode,
    "UpdateCard": UpdateCard,
    "CreateShape": CreateShape,
    "UpdateShape": UpdateShape,
    "DeleteShape": DeleteShape,
}


class _QueuedTask(Base):
    """ORM model for persisted queue tasks."""

    __tablename__ = "queue_tasks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    type: Mapped[str] = mapped_column(String, nullable=False)
    payload: Mapped[str] = mapped_column(Text, nullable=False)


class QueuePersistence:
    """Store pending change tasks and idempotent responses in the main DB."""

    def __init__(self, _path: str | None = None) -> None:  # noqa: D401 - path unused
        # Ensure tables exist on initialisation.
        Base.metadata.create_all(bind=engine)

    # ------------------------------------------------------------------
    # Task persistence
    # ------------------------------------------------------------------
    async def save(self, task: ChangeTask) -> None:
        """Persist ``task`` to the database."""

        await asyncio.to_thread(self._insert, task)

    def _insert(self, task: ChangeTask) -> None:
        with SessionLocal() as session:
            session.add(
                _QueuedTask(
                    type=task.__class__.__name__, payload=task.model_dump_json()
                )
            )
            session.commit()

    async def delete(self, task: ChangeTask) -> None:
        """Remove ``task`` from the database."""

        await asyncio.to_thread(self._delete_one, task)

    def _delete_one(self, task: ChangeTask) -> None:
        with SessionLocal() as session:
            stmt = (
                select(_QueuedTask)
                .where(
                    _QueuedTask.type == task.__class__.__name__,
                    _QueuedTask.payload == task.model_dump_json(),
                )
                .limit(1)
            )
            record = session.execute(stmt).scalar_one_or_none()
            if record is not None:
                session.delete(record)
                session.commit()

    def load(self) -> list[ChangeTask]:
        """Return all persisted tasks in FIFO order."""

        with SessionLocal() as session:
            records = session.execute(
                select(_QueuedTask).order_by(_QueuedTask.id)
            ).scalars()
            rows = list(records)
        tasks: list[ChangeTask] = []
        for row in rows:
            cls = _TASK_TYPES.get(row.type)
            if cls is None:
                continue
            tasks.append(cls.model_validate_json(row.payload))
        return tasks

    # ------------------------------------------------------------------
    # Idempotent responses
    # ------------------------------------------------------------------
    async def get_response(self, key: str) -> dict[str, Any] | None:
        """Return a stored response for ``key`` if present."""

        return await asyncio.to_thread(self._get_response, key)

    def _get_response(self, key: str) -> dict[str, Any] | None:
        with SessionLocal() as session:
            result = session.get(Idempotency, key)
            if result is None:
                return None
            return result.response

    async def save_response(self, key: str, response: dict[str, Any]) -> None:
        """Persist ``response`` under ``key``."""

        await asyncio.to_thread(self._save_response, key, response)

    def _save_response(self, key: str, response: dict[str, Any]) -> None:
        with SessionLocal() as session:
            session.merge(Idempotency(key=key, response=response))
            session.commit()

    # Backwards-compatible aliases
    async def save_idempotent(self, key: str, response: dict[str, Any]) -> None:
        await self.save_response(key, response)

    async def get_idempotent(self, key: str) -> dict[str, Any] | None:
        return await self.get_response(key)
