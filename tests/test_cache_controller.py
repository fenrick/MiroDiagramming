"""Tests for the cache router."""

from __future__ import annotations

from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from miro_backend.db.session import Base, SessionLocal, engine, get_session
from miro_backend.main import app
from miro_backend.models import CacheEntry


# mypy struggles with pytest decorators
@pytest.fixture  # type: ignore[misc]
def client_session() -> Iterator[tuple[TestClient, Session]]:
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()

    def override_get_session() -> Iterator[Session]:
        try:
            yield session
        finally:
            pass

    app.dependency_overrides[get_session] = override_get_session
    client = TestClient(app)
    yield client, session
    session.close()
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine)


def test_get_cache_returns_board_state(
    client_session: tuple[TestClient, Session]
) -> None:
    client, session = client_session
    session.add(CacheEntry(key="b1", value={"id": "b1", "name": "Board"}))
    session.commit()
    response = client.get("/api/cache/b1")
    assert response.status_code == 200
    assert response.json() == {"id": "b1", "name": "Board"}


def test_get_cache_returns_404_when_missing(
    client_session: tuple[TestClient, Session]
) -> None:
    client, _ = client_session
    response = client.get("/api/cache/missing")
    assert response.status_code == 404
