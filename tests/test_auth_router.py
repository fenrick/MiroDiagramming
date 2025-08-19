"""Tests for the FastAPI auth router."""

from __future__ import annotations

from datetime import datetime, timezone
from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient

from miro_backend.main import app
from miro_backend.schemas.user_info import UserInfo
from miro_backend.services.user_store import InMemoryUserStore, get_user_store


# mypy struggles with pytest decorators
@pytest.fixture  # type: ignore[misc]
def client_store() -> Iterator[tuple[TestClient, InMemoryUserStore]]:
    store = InMemoryUserStore()
    app.dependency_overrides[get_user_store] = lambda: store
    client = TestClient(app)
    yield client, store
    app.dependency_overrides.clear()


def test_get_status_returns_ok_when_user_present(
    client_store: tuple[TestClient, InMemoryUserStore],
) -> None:
    client, store = client_store
    store.store(
        UserInfo(
            id="u1",
            name="n",
            access_token="a",
            refresh_token="r",
            expires_at=datetime.now(timezone.utc),
        )
    )
    response = client.get("/api/auth/status", headers={"X-User-Id": "u1"})
    assert response.status_code == 200


def test_get_status_returns_not_found_for_missing_user(
    client_store: tuple[TestClient, InMemoryUserStore],
) -> None:
    client, _ = client_store
    response = client.get("/api/auth/status", headers={"X-User-Id": "u2"})
    assert response.status_code == 404


def test_get_status_returns_bad_request_without_header(
    client_store: tuple[TestClient, InMemoryUserStore],
) -> None:
    client, _ = client_store
    response = client.get("/api/auth/status")
    assert response.status_code == 400
