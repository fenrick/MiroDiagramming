import httpx
from urllib.parse import parse_qsl
from typing import Any, cast

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

    class TestClient(MiroClient):  # type: ignore[misc]
        async def refresh_token(self, refresh_token: str) -> dict[str, Any]:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.miro.com/v1/oauth/token",
                    data={
                        "grant_type": "refresh_token",
                        "refresh_token": refresh_token,
                        "client_id": settings.client_id,
                        "client_secret": settings.client_secret.get_secret_value(),
                    },
                    headers={"Content-Type": "application/x-www-form-urlencoded"},
                )
                response.raise_for_status()
                return cast(dict[str, Any], response.json())

    client = TestClient()
    res = await client.refresh_token("r")

    assert res == {"access_token": "a", "refresh_token": "b", "expires_in": 1}
    assert captured == {
        "grant_type": "refresh_token",
        "refresh_token": "r",
        "client_id": settings.client_id,
        "client_secret": settings.client_secret.get_secret_value(),
    }
