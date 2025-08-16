"""Verify idempotency persistence helpers."""

from __future__ import annotations

import pytest

from miro_backend.queue.persistence import QueuePersistence


@pytest.mark.asyncio()  # type: ignore[misc]
async def test_save_and_get_idempotent() -> None:
    """Saving and retrieving by key should round-trip the response."""

    persistence = QueuePersistence()
    data = {"ok": True}

    await persistence.save_idempotent("k1", data)
    assert await persistence.get_idempotent("k1") == data


@pytest.mark.asyncio()  # type: ignore[misc]
async def test_get_idempotent_missing() -> None:
    """Missing keys should return ``None``."""

    persistence = QueuePersistence()

    assert await persistence.get_idempotent("missing") is None
