"""Tests for the OAuth router."""

from __future__ import annotations

from collections.abc import Iterator
from urllib.parse import parse_qs, urlparse

import pytest
from fastapi.testclient import TestClient

from miro_backend.api.routers import oauth
from miro_backend.main import app
from miro_backend.services.miro_client import MiroClient
from miro_backend.services.user_store import InMemoryUserStore, get_user_store


class StubClient(MiroClient):  # type: ignore[misc]
    """Fake client capturing exchange calls."""

    def __init__(self) -> None:
        self.calls: list[tuple[str, str]] = []

    async def exchange_code(self, code: str, redirect_uri: str) -> dict[str, int | str]:
        self.calls.append((code, redirect_uri))
        return {"access_token": "tok", "refresh_token": "ref", "expires_in": 3600}


@pytest.fixture  # type: ignore[misc]
def client_store() -> Iterator[tuple[TestClient, InMemoryUserStore, StubClient]]:
    store = InMemoryUserStore()
    stub = StubClient()
    cfg = oauth.OAuthConfig(
        auth_base="http://auth",
        client_id="id",
        client_secret="secret",
        redirect_uri="http://redir",
    )
    app.dependency_overrides[get_user_store] = lambda: store
    app.dependency_overrides[oauth.get_miro_client] = lambda: stub
    app.dependency_overrides[oauth.get_oauth_config] = lambda: cfg
    client = TestClient(app)
    yield client, store, stub
    app.dependency_overrides.clear()


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
