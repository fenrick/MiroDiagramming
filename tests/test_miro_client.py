from urllib.parse import parse_qsl
from typing import Any, Awaitable, Callable

import httpx
import pytest

from miro_backend.core.config import settings
from miro_backend.services.miro_client import MiroClient


@pytest.mark.asyncio()  # type: ignore[misc]
async def test_exchange_code(monkeypatch: pytest.MonkeyPatch) -> None:
    captured: dict[str, str] = {}

    async def handler(request: httpx.Request) -> httpx.Response:
        captured.update(dict(parse_qsl(request.content.decode())))
        return httpx.Response(200, json={"ok": True})

    transport = httpx.MockTransport(handler)
    async_client = httpx.AsyncClient(transport=transport)
    monkeypatch.setattr(httpx, "AsyncClient", lambda *args, **kwargs: async_client)

    client = MiroClient()
    res = await client.exchange_code(
        "c",
        "redir",
        "https://api.miro.com/v1/oauth/token",
        settings.client_id,
        settings.client_secret.get_secret_value(),
        None,
    )

    assert res == {"ok": True}
    assert captured == {
        "grant_type": "authorization_code",
        "code": "c",
        "redirect_uri": "redir",
        "client_id": settings.client_id,
        "client_secret": settings.client_secret.get_secret_value(),
    }


@pytest.mark.asyncio()  # type: ignore[misc]
async def test_refresh_token(monkeypatch: pytest.MonkeyPatch) -> None:
    captured: dict[str, str] = {}

    async def handler(request: httpx.Request) -> httpx.Response:
        captured.update(dict(parse_qsl(request.content.decode())))
        return httpx.Response(
            200,
            json={"access_token": "a", "refresh_token": "b", "expires_in": 1},
        )

    transport = httpx.MockTransport(handler)
    async_client = httpx.AsyncClient(transport=transport)
    monkeypatch.setattr(httpx, "AsyncClient", lambda *args, **kwargs: async_client)

    client = MiroClient()
    res = await client.refresh_token("r")

    assert res == {"access_token": "a", "refresh_token": "b", "expires_in": 1}
    assert captured == {
        "grant_type": "refresh_token",
        "refresh_token": "r",
        "client_id": settings.client_id,
        "client_secret": settings.client_secret.get_secret_value(),
    }


@pytest.mark.asyncio()  # type: ignore[misc]
@pytest.mark.parametrize(  # type: ignore[misc]
    ("caller", "method", "url"),
    [
        (lambda c: c.create_node("n", {}, "t"), "PUT", "/graph/nodes/n"),
        (lambda c: c.update_card("c1", {}, "t"), "PATCH", "/cards/c1"),
        (
            lambda c: c.create_shape("b", "s", {}, "t"),
            "PUT",
            "/boards/b/shapes/s",
        ),
        (
            lambda c: c.update_shape("b", "s", {}, "t"),
            "PATCH",
            "/boards/b/shapes/s",
        ),
        (lambda c: c.delete_shape("b", "s", "t"), "DELETE", "/boards/b/shapes/s"),
        (
            lambda c: c.exchange_code(
                "code",
                "redir",
                "https://api.miro.com/v1/oauth/token",
                "id",
                "secret",
                None,
            ),
            "POST",
            "https://api.miro.com/v1/oauth/token",
        ),
        (
            lambda c: c.refresh_token("r"),
            "POST",
            settings.oauth_token_url,
        ),
    ],
)
async def test_api_methods_delegate_to_request(
    monkeypatch: pytest.MonkeyPatch,
    caller: Callable[[MiroClient], Awaitable[Any]],
    method: str,
    url: str,
) -> None:
    client = MiroClient()
    captured: dict[str, str] = {}

    async def fake_request(
        self: MiroClient, m: str, u: str, **kwargs: object
    ) -> httpx.Response:
        captured["method"] = m
        captured["url"] = u
        return httpx.Response(200, json={})

    monkeypatch.setattr(MiroClient, "_request", fake_request)
    await caller(client)
    assert captured["method"] == method
    assert captured["url"] == url
