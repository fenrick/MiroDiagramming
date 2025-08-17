"""Verify periodic idempotency cleanup."""

from __future__ import annotations

import asyncio
import sqlite3
from pathlib import Path

import pytest

from miro_backend.queue.persistence import (
    QueuePersistence,
    purge_expired_idempotency,
)


def _backdate(db: Path, key: str, days: int) -> None:
    with sqlite3.connect(db) as conn:
        conn.execute(
            "UPDATE idempotency SET created_at = datetime('now', ?) WHERE key = ?",
            (f"-{days} days", key),
        )
        conn.commit()


@pytest.mark.asyncio()  # type: ignore[misc]
async def test_purge_expired_idempotency(tmp_path: Path) -> None:
    """Old idempotency rows should be removed."""

    db = tmp_path / "idem.db"
    persistence = QueuePersistence(db)
    await persistence.save_idempotent("old", {"ok": 1})
    await persistence.save_idempotent("recent", {"ok": 2})
    await asyncio.to_thread(_backdate, db, "old", 3)

    purge_expired_idempotency(db, older_than_hours=48)

    assert await persistence.get_idempotent("old") is None
    assert await persistence.get_idempotent("recent") == {"ok": 2}
