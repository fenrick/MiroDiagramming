"""Persistence layer for queued tasks and idempotent responses."""

from __future__ import annotations

import asyncio
from typing import Any, Type

from sqlalchemy import Integer, String, Text
from sqlalchemy.orm import Mapped, Session, mapped_column, sessionmaker
from sqlalchemy.exc import OperationalError

from ..db.session import Base, SessionLocal
from ..models import Idempotency
from .tasks import (
    ChangeTask,
    CreateNode,
    UpdateCard,
    CreateShape,
    UpdateShape,
    DeleteShape,
)

_TASK_TYPES: dict[str, Type[ChangeTask]] = {
    "CreateNode": CreateNode,
    "UpdateCard": UpdateCard,
    "CreateShape": CreateShape,
    "UpdateShape": UpdateShape,
    "DeleteShape": DeleteShape,
}


class QueuedTask(Base):
    """Persisted representation of enqueued change tasks."""

    __tablename__ = "queue_tasks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    type: Mapped[str] = mapped_column(String, index=True)
    payload: Mapped[str] = mapped_column(Text)


class SqlAlchemyQueuePersistence:
    """Store queue state and idempotent responses in the main database."""

    def __init__(self, session_factory: sessionmaker[Session] = SessionLocal) -> None:
        self._session_factory = session_factory
        engine = getattr(session_factory, "bind", None)
        if engine is not None:
            Base.metadata.create_all(bind=engine)

    async def save(self, task: ChangeTask) -> None:
        await asyncio.to_thread(self._save, task)

    def _save(self, task: ChangeTask) -> None:
        with self._session_factory() as session:
            session.add(
                QueuedTask(
                    type=task.__class__.__name__,
                    payload=task.model_dump_json(),
                )
            )
            session.commit()

    async def delete(self, task: ChangeTask) -> None:
        await asyncio.to_thread(self._delete, task)

    def _delete(self, task: ChangeTask) -> None:
        with self._session_factory() as session:
            row = (
                session.query(QueuedTask)
                .filter_by(type=task.__class__.__name__, payload=task.model_dump_json())
                .first()
            )
            if row is not None:
                session.delete(row)
                session.commit()

    def load(self) -> list[ChangeTask]:
        with self._session_factory() as session:
            try:
                rows = session.query(QueuedTask).order_by(QueuedTask.id).all()
            except OperationalError:
                return []
        tasks: list[ChangeTask] = []
        for row in rows:
            cls = _TASK_TYPES.get(row.type)
            if cls is None:
                continue
            tasks.append(cls.model_validate_json(row.payload))
        return tasks

    async def save_idempotent(self, key: str, response: dict[str, Any]) -> None:
        await asyncio.to_thread(self._save_idempotent, key, response)

    def _save_idempotent(self, key: str, response: dict[str, Any]) -> None:
        with self._session_factory() as session:
            session.merge(Idempotency(key=key, response=response))
            session.commit()

    async def get_idempotent(self, key: str) -> dict[str, Any] | None:
        return await asyncio.to_thread(self._get_idempotent, key)

    def _get_idempotent(self, key: str) -> dict[str, Any] | None:
        with self._session_factory() as session:
            entry = session.get(Idempotency, key)
            return entry.response if entry is not None else None


# Backwards compatibility
QueuePersistence = SqlAlchemyQueuePersistence
