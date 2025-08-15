from __future__ import annotations

import asyncio
import sqlite3
from pathlib import Path
from typing import Type

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


class QueuePersistence:
    """Store pending change tasks in a SQLite database."""

    def __init__(self, path: str | Path = "queue.db") -> None:
        self._path = Path(path)
        self._path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _init_db(self) -> None:
        with sqlite3.connect(self._path) as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS tasks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    type TEXT NOT NULL,
                    payload TEXT NOT NULL
                )
                """
            )
            conn.commit()

    async def save(self, task: ChangeTask) -> None:
        """Persist ``task`` to the database."""

        await asyncio.to_thread(self._insert, task)

    def _insert(self, task: ChangeTask) -> None:
        with sqlite3.connect(self._path) as conn:
            conn.execute(
                "INSERT INTO tasks (type, payload) VALUES (?, ?)",
                (task.__class__.__name__, task.model_dump_json()),
            )
            conn.commit()

    async def delete(self, task: ChangeTask) -> None:
        """Remove ``task`` from the database."""

        await asyncio.to_thread(self._delete_one, task)

    def _delete_one(self, task: ChangeTask) -> None:
        with sqlite3.connect(self._path) as conn:
            conn.execute(
                "DELETE FROM tasks WHERE id IN (SELECT id FROM tasks WHERE type = ? AND payload = ? LIMIT 1)",
                (task.__class__.__name__, task.model_dump_json()),
            )
            conn.commit()

    def load(self) -> list[ChangeTask]:
        """Return all persisted tasks in FIFO order."""

        with sqlite3.connect(self._path) as conn:
            cursor = conn.execute("SELECT type, payload FROM tasks ORDER BY id")
            rows = cursor.fetchall()

        tasks: list[ChangeTask] = []
        for type_name, payload in rows:
            cls = _TASK_TYPES.get(type_name)
            if cls is None:
                continue
            tasks.append(cls.model_validate_json(payload))
        return tasks
