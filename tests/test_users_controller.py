"""Tests for the FastAPI users router."""

from __future__ import annotations

from datetime import datetime, timezone
from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from miro_backend import main
from miro_backend.main import app
from miro_backend.db.session import Base, SessionLocal, engine, get_session
from miro_backend.models import User
from miro_backend.queue import ChangeQueue


@pytest.fixture(autouse=True)  # type: ignore[misc]
def setup_db() -> Iterator[None]:
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture  # type: ignore[misc]
def client() -> Iterator[TestClient]:
    def _get_session() -> Iterator[Session]:
        session = SessionLocal()
        try:
            yield session
        finally:
            session.close()

    app.dependency_overrides[get_session] = _get_session
    main.change_queue = ChangeQueue()
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def test_create_user_persists_and_returns_201(client: TestClient) -> None:
    payload = {
        "id": "u1",
        "name": "Alice",
        "access_token": "a",
        "refresh_token": "r",
        "expires_at": datetime.now(timezone.utc).isoformat(),
    }
    response = client.post("/api/users", json=payload)
    assert response.status_code == 201

    session = SessionLocal()
    try:
        user = session.query(User).filter_by(user_id="u1").first()
        assert user is not None
        assert user.name == "Alice"
    finally:
        session.close()


def test_create_user_rejects_duplicates(client: TestClient) -> None:
    payload = {
        "id": "u1",
        "name": "Alice",
        "access_token": "a",
        "refresh_token": "r",
        "expires_at": datetime.now(timezone.utc).isoformat(),
    }
    assert client.post("/api/users", json=payload).status_code == 201
    duplicate = client.post("/api/users", json=payload)
    assert duplicate.status_code == 409
