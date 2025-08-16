"""Tests for the OAuth router."""

from __future__ import annotations

from collections.abc import Iterator
from urllib.parse import parse_qs, urlparse

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from miro_backend.api.routers import oauth
from miro_backend.db.session import engine
from miro_backend.main import app
from miro_backend.models.user import User
from miro_backend.services.miro_client import MiroClient
from miro_backend.services.user_store import InMemoryUserStore, get_user_store


class StubClient(MiroClient):  # type: ignore[misc]
    """Fake client capturing exchange calls."""

    def __init__(self) -> None:
        self.calls: list[tuple[str, str]] = []

    async def exchange_code(
        self,
        code: str,
        redirect_uri: str,
        token_url: str,
        client_id: str,
        client_secret: str,
        timeout_seconds: float | None = None,
    ) -> dict[str, int | str]:
        self.calls.append((code, redirect_uri))
        return {"access_token": "tok", "refresh_token": "ref", "expires_in": 3600}


class CountingStub(MiroClient):  # type: ignore[misc]
    """Stub client returning incrementing tokens."""

    def __init__(self) -> None:
        self.calls: list[tuple[str, str]] = []

    async def exchange_code(
        self,
        code: str,
        redirect_uri: str,
        token_url: str,
        client_id: str,
        client_secret: str,
        timeout_seconds: float | None = None,
    ) -> dict[str, int | str]:
        self.calls.append((code, redirect_uri))
        n = len(self.calls)
        return {
            "access_token": f"tok{n}",
            "refresh_token": f"ref{n}",
            "expires_in": 3600,
        }


@pytest.fixture  # type: ignore[misc]
def client_store() -> Iterator[tuple[TestClient, InMemoryUserStore, StubClient]]:
    store = InMemoryUserStore()
    stub = StubClient()
    cfg = oauth.OAuthConfig(
        auth_base="http://auth",
        client_id="id",
        client_secret="secret",
        redirect_uri="http://redir",
        scope="boards:read boards:write",
        token_url="http://token",
        timeout_seconds=1.0,
    )
    app.dependency_overrides[get_user_store] = lambda: store
    app.dependency_overrides[oauth.get_miro_client] = lambda: stub
    app.dependency_overrides[oauth.get_oauth_config] = lambda: cfg
    User.__table__.create(bind=engine, checkfirst=True)
    client = TestClient(app)
    yield client, store, stub
    app.dependency_overrides.clear()
    User.__table__.drop(bind=engine)


@pytest.fixture  # type: ignore[misc]
def client_store_db() -> Iterator[tuple[TestClient, InMemoryUserStore, CountingStub]]:
    store = InMemoryUserStore()
    stub = CountingStub()
    cfg = oauth.OAuthConfig(
        auth_base="http://auth",
        client_id="id",
        client_secret="secret",
        redirect_uri="http://redir",
        scope="boards:read boards:write",
        token_url="http://token",
        timeout_seconds=1.0,
    )
    app.dependency_overrides[get_user_store] = lambda: store
    app.dependency_overrides[oauth.get_miro_client] = lambda: stub
    app.dependency_overrides[oauth.get_oauth_config] = lambda: cfg
    User.__table__.create(bind=engine, checkfirst=True)
    client = TestClient(app)
    yield client, store, stub
    app.dependency_overrides.clear()
    User.__table__.drop(bind=engine)


def test_login_redirects_to_miro(
    client_store: tuple[TestClient, InMemoryUserStore, StubClient]
) -> None:
    client, _, _ = client_store
    res = client.get("/oauth/login", params={"userId": "u1"}, allow_redirects=False)
    assert res.status_code == 307
    loc = res.headers["location"]
    parsed = urlparse(loc)
    assert parsed.scheme + "://" + parsed.netloc == "http://auth"
    assert parsed.path == "/oauth/authorize"
    q = parse_qs(parsed.query)
    assert q["client_id"] == ["id"]
    assert q["redirect_uri"] == ["http://redir"]
    assert q["response_type"] == ["code"]
    assert q["scope"] == ["boards:read boards:write"]
    assert q["state"][0].endswith(":u1")


def test_callback_exchanges_code_and_stores_tokens(
    client_store: tuple[TestClient, InMemoryUserStore, StubClient]
) -> None:
    client, store, stub = client_store
    res = client.get(
        "/oauth/callback",
        params={"code": "c", "state": "x:u1"},
        allow_redirects=False,
    )
    assert res.status_code == 307
    assert res.headers["location"] == "/app.html"
    info = store.retrieve("u1")
    assert info is not None
    assert info.access_token == "tok"
    assert info.refresh_token == "ref"
    assert stub.calls == [("c", "http://redir")]


def test_callback_rejects_invalid_state(
    client_store: tuple[TestClient, InMemoryUserStore, StubClient]
) -> None:
    client, store, stub = client_store
    res = client.get(
        "/oauth/callback", params={"code": "c", "state": "bad"}, allow_redirects=False
    )
    assert res.status_code == 400
    assert store.retrieve("u1") is None
    assert stub.calls == []


def test_callback_upserts_user_record(
    client_store_db: tuple[TestClient, InMemoryUserStore, CountingStub]
) -> None:
    client, store, stub = client_store_db
    res = client.get(
        "/oauth/callback",
        params={"code": "c1", "state": "x:u1"},
        allow_redirects=False,
    )
    assert res.status_code == 307
    res = client.get(
        "/oauth/callback",
        params={"code": "c2", "state": "x:u1"},
        allow_redirects=False,
    )
    assert res.status_code == 307
    with Session(bind=engine) as db:
        users = db.query(User).all()
        assert len(users) == 1
        user = users[0]
        assert user.access_token == "tok2"
        assert user.refresh_token == "ref2"
    info = store.retrieve("u1")
    assert info is not None
    assert info.access_token == "tok2"
    assert info.refresh_token == "ref2"
    assert stub.calls == [("c1", "http://redir"), ("c2", "http://redir")]
