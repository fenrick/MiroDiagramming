"""Persistence layer for queued tasks and idempotent responses."""

from __future__ import annotations

import asyncio
from datetime import datetime
from enum import StrEnum
from typing import Any, Type

from sqlalchemy import DateTime, Enum as SAEnum, Integer, String, Text, func
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Mapped, Session, mapped_column, sessionmaker

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


class TaskStatus(StrEnum):
    """Lifecycle states for persisted tasks."""

    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class QueuedTask(Base):
    """Persisted representation of enqueued change tasks."""

    __tablename__ = "queue_tasks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    type: Mapped[str] = mapped_column(String, index=True)
    payload: Mapped[str] = mapped_column(Text)
    status: Mapped[TaskStatus] = mapped_column(
        SAEnum(TaskStatus, native_enum=False), default=TaskStatus.QUEUED, index=True
    )
    claimed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    attempts: Mapped[int] = mapped_column(Integer, default=0)


class DeadLetterTask(Base):
    """Persisted representation of tasks sent to the dead letter queue."""

    __tablename__ = "dead_letter_tasks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    type: Mapped[str] = mapped_column(String, index=True)
    payload: Mapped[str] = mapped_column(Text)
    error: Mapped[str] = mapped_column(Text)


class SqlAlchemyQueuePersistence:
    """Store queue state and idempotent responses in the main database."""

    def __init__(self, session_factory: sessionmaker[Session] = SessionLocal) -> None:
        self._session_factory = session_factory
        engine = getattr(session_factory, "bind", None)
        if engine is not None:
            Base.metadata.create_all(bind=engine)

    async def save(self, task: ChangeTask) -> int:
        return await asyncio.to_thread(self._save, task)

    def _save(self, task: ChangeTask) -> int:
        with self._session_factory() as session:
            row = QueuedTask(
                type=task.__class__.__name__,
                payload=task.model_dump_json(),
                status=TaskStatus.QUEUED,
                attempts=0,
            )
            session.add(row)
            session.commit()
            return row.id

    async def delete(self, task_id: int) -> None:
        await asyncio.to_thread(self._delete, task_id)

    def _delete(self, task_id: int) -> None:
        with self._session_factory() as session:
            row = session.get(QueuedTask, task_id)
            if row is not None:
                session.delete(row)
                session.commit()

    def load(self) -> list[ChangeTask]:
        with self._session_factory() as session:
            try:
                rows = (
                    session.query(QueuedTask)
                    .filter_by(status=TaskStatus.QUEUED)
                    .order_by(QueuedTask.id)
                    .all()
                )
            except OperationalError:
                return []
        tasks: list[ChangeTask] = []
        for row in rows:
            cls = _TASK_TYPES.get(row.type)
            if cls is None:
                continue
            tasks.append(cls.model_validate_json(row.payload))
        return tasks

    async def claim_next(self) -> tuple[int, ChangeTask] | None:
        return await asyncio.to_thread(self._claim_next)

    def _claim_next(self) -> tuple[int, ChangeTask] | None:
        with self._session_factory() as session:
            try:
                dialect = session.bind.dialect.name if session.bind is not None else ""
                query = (
                    session.query(QueuedTask)
                    .filter_by(status=TaskStatus.QUEUED)
                    .order_by(QueuedTask.id)
                )
                if dialect == "postgresql":
                    row = query.with_for_update(skip_locked=True).first()
                else:
                    row = query.first()
            except OperationalError:
                return None
            if row is None:
                return None
            row.status = TaskStatus.PROCESSING
            row.claimed_at = func.now()
            session.flush()
            cls = _TASK_TYPES.get(row.type)
            if cls is None:
                session.commit()
                return None
            task = cls.model_validate_json(row.payload)
            session.commit()
            return row.id, task

    async def mark_completed(self, task_id: int) -> None:
        """Mark ``task_id`` as completed in persistence."""

        await asyncio.to_thread(self._mark_completed, task_id)

    def _mark_completed(self, task_id: int) -> None:
        with self._session_factory() as session:
            row = session.get(QueuedTask, task_id)
            if row is not None:
                row.status = TaskStatus.COMPLETED
                session.commit()

    async def reset_to_queued(self, task_id: int) -> None:
        """Reset ``task_id`` to queued state and increment its attempt count."""

        await asyncio.to_thread(self._reset_to_queued, task_id)

    def _reset_to_queued(self, task_id: int) -> None:
        with self._session_factory() as session:
            row = session.get(QueuedTask, task_id)
            if row is not None:
                row.status = TaskStatus.QUEUED
                row.claimed_at = None
                row.attempts = (row.attempts or 0) + 1
                session.commit()

    async def mark_failed(self, task_id: int) -> None:
        """Mark ``task_id`` as failed and remove it from persistence."""

        await asyncio.to_thread(self._mark_failed, task_id)

    def _mark_failed(self, task_id: int) -> None:
        with self._session_factory() as session:
            row = session.get(QueuedTask, task_id)
            if row is not None:
                row.status = TaskStatus.FAILED
                session.flush()
                session.delete(row)
                session.commit()

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
