"""Tests for the generic repository."""

from __future__ import annotations

from miro_backend.db.session import Base, SessionLocal, engine
from miro_backend.models import CacheEntry
from miro_backend.services.repository import Repository


def setup_module() -> None:
    """Create database tables for tests."""

    Base.metadata.create_all(bind=engine)


def teardown_module() -> None:
    """Drop database tables after tests."""

    Base.metadata.drop_all(bind=engine)


def test_repository_crud() -> None:
    session = SessionLocal()
    repo = Repository(session, CacheEntry)

    entry = CacheEntry(key="alpha", value={"n": 1})
    repo.add(entry)

    fetched = repo.get(entry.id)
    assert fetched is not None
    assert fetched.key == "alpha"

    fetched.value = {"n": 2}
    repo.add(fetched)

    updated = repo.get(entry.id)
    assert updated is not None
    assert updated.value["n"] == 2

    repo.delete(updated)
    assert repo.get(entry.id) is None

    session.close()
