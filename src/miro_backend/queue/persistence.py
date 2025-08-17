from __future__ import annotations

import asyncio
import json
import sqlite3
from pathlib import Path
from typing import Any, Type, cast

import logfire

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
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS idempotency (
                    key TEXT PRIMARY KEY,
                    response TEXT NOT NULL,
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
                """
            )
            conn.commit()
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS responses (
                    key TEXT PRIMARY KEY,
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

    async def get_response(self, key: str) -> dict[str, Any] | None:
        """Return a stored response for ``key`` if present."""

        return await asyncio.to_thread(self._get_response, key)

    def _get_response(self, key: str) -> dict[str, Any] | None:
        with sqlite3.connect(self._path) as conn:
            cursor = conn.execute("SELECT payload FROM responses WHERE key = ?", (key,))
            row = cursor.fetchone()
        if row is None:
            return None
        return cast(dict[str, Any], json.loads(row[0]))

    async def save_response(self, key: str, response: dict[str, Any]) -> None:
        """Persist ``response`` under ``key``."""

        await asyncio.to_thread(self._save_response, key, response)

    def _save_response(self, key: str, response: dict[str, Any]) -> None:
        with sqlite3.connect(self._path) as conn:
            conn.execute(
                "INSERT OR REPLACE INTO responses (key, payload) VALUES (?, ?)",
                (key, json.dumps(response)),
            )
            conn.commit()

    async def save_idempotent(self, key: str, response: dict[str, Any]) -> None:
        """Persist ``response`` for an idempotency ``key``."""

        await asyncio.to_thread(self._insert_idempotent, key, response)

    def _insert_idempotent(self, key: str, response: dict[str, Any]) -> None:
        with sqlite3.connect(self._path) as conn:
            conn.execute(
                "INSERT OR REPLACE INTO idempotency (key, response) VALUES (?, ?)",
                (key, json.dumps(response)),
            )
            conn.commit()

    async def get_idempotent(self, key: str) -> dict[str, Any] | None:
        """Return a cached response for ``key`` if present."""

        return await asyncio.to_thread(self._select_idempotent, key)

    def _select_idempotent(self, key: str) -> dict[str, Any] | None:
        with sqlite3.connect(self._path) as conn:
            cursor = conn.execute(
                "SELECT response FROM idempotency WHERE key = ?",
                (key,),
            )
            row = cursor.fetchone()
        if row is None:
            return None
        return cast(dict[str, Any], json.loads(row[0]))


def purge_expired_idempotency(
    path: str | Path = "queue.db", *, older_than_hours: int = 48
) -> None:
    """Remove idempotency records older than ``older_than_hours``."""

    with sqlite3.connect(path) as conn:
        cursor = conn.execute(
            "DELETE FROM idempotency WHERE created_at < datetime('now', ?)",
            (f"-{older_than_hours} hours",),
        )
        conn.commit()
    logfire.info("purged idempotency rows", count=cursor.rowcount)


async def cleanup_idempotency(
    path: str | Path = "queue.db",
    *,
    older_than_hours: int = 48,
    interval_hours: int = 24,
) -> None:
    """Continuously purge stale idempotency records every ``interval_hours``."""

    while True:
        await asyncio.to_thread(
            purge_expired_idempotency, path, older_than_hours=older_than_hours
        )
        await asyncio.sleep(interval_hours * 60 * 60)
