import httpx
from urllib.parse import parse_qsl

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
    res = await client.exchange_code("c", "redir")

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
        return httpx.Response(200, json={"ok": True})

    transport = httpx.MockTransport(handler)
    async_client = httpx.AsyncClient(transport=transport)
    monkeypatch.setattr(httpx, "AsyncClient", lambda *args, **kwargs: async_client)

    client = MiroClient()
    res = await client.refresh_token("r")

    assert res == {"ok": True}
    assert captured == {
        "grant_type": "refresh_token",
        "refresh_token": "r",
        "client_id": settings.client_id,
        "client_secret": settings.client_secret.get_secret_value(),
    }
