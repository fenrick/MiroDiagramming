"""Tests for the database-backed user store."""

from __future__ import annotations

from collections.abc import Iterator
from datetime import datetime, timezone

import pytest
from sqlalchemy.orm import Session

from miro_backend.db.session import Base, SessionLocal, engine
from miro_backend.schemas.user_info import UserInfo
from miro_backend.services.user_store import DbUserStore


@pytest.fixture(autouse=True)  # type: ignore[misc]
def setup_db() -> Iterator[None]:
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture  # type: ignore[misc]
def session() -> Iterator[Session]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_store_and_retrieve(session: Session) -> None:
    """Stored user info should round-trip through the database."""

    store = DbUserStore(session)
    info = UserInfo(
        id="u1",
        name="Test",
        access_token="a",
        refresh_token="r",
        expires_at=datetime(2030, 1, 1, tzinfo=timezone.utc),
    )

    assert store.retrieve("u1") is None
    store.store(info)
    assert store.retrieve("u1") == info


def test_store_updates_existing_record(session: Session) -> None:
    """Storing twice should update the existing user row."""

    store = DbUserStore(session)
    original = UserInfo(
        id="u1",
        name="Old",
        access_token="a1",
        refresh_token="r1",
        expires_at=datetime(2030, 1, 1, tzinfo=timezone.utc),
    )
    store.store(original)

    updated = UserInfo(
        id="u1",
        name="New",
        access_token="a2",
        refresh_token="r2",
        expires_at=datetime(2031, 1, 1, tzinfo=timezone.utc),
    )
    store.store(updated)

    assert store.retrieve("u1") == updated
