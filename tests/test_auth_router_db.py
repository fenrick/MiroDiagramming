"""Integration tests for the auth router using the database store."""

from __future__ import annotations

from collections.abc import Iterator
from datetime import datetime, timezone

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
    main.change_queue = ChangeQueue()


def test_status_returns_ok_when_user_exists(client: TestClient) -> None:
    """Endpoint should return 200 when the user tokens are stored."""

    session = SessionLocal()
    try:
        session.add(
            User(
                user_id="u1",
                name="Alice",
                access_token="a",
                refresh_token="r",
                expires_at=datetime.now(timezone.utc),
            )
        )
        session.commit()
    finally:
        session.close()

    response = client.get("/api/auth/status", headers={"X-User-Id": "u1"})
    assert response.status_code == 200


def test_status_returns_not_found_when_user_missing(client: TestClient) -> None:
    """Endpoint should return 404 when tokens are absent."""

    response = client.get("/api/auth/status", headers={"X-User-Id": "u2"})
    assert response.status_code == 404
