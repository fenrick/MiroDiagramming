"""Verify idempotency persistence helpers."""

from __future__ import annotations

from pathlib import Path

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from miro_backend.db.session import Base
from miro_backend.queue.persistence import SqlAlchemyQueuePersistence


@pytest.mark.asyncio()  # type: ignore[misc]
async def test_save_and_get_idempotent(tmp_path: Path) -> None:
    """Saving and retrieving by key should round-trip the response."""

    engine = create_engine(
        f"sqlite:///{tmp_path/'idem.db'}", connect_args={"check_same_thread": False}
    )
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    persistence = SqlAlchemyQueuePersistence(Session)
    data = {"ok": True}

    await persistence.save_idempotent("k1", data)
    assert await persistence.get_idempotent("k1") == data


@pytest.mark.asyncio()  # type: ignore[misc]
async def test_get_idempotent_missing(tmp_path: Path) -> None:
    """Missing keys should return ``None``."""

    engine = create_engine(
        f"sqlite:///{tmp_path/'idem.db'}", connect_args={"check_same_thread": False}
    )
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    persistence = SqlAlchemyQueuePersistence(Session)

    assert await persistence.get_idempotent("missing") is None
