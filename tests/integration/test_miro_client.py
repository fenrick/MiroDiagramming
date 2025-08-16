"""Tests for the Miro REST client."""

from __future__ import annotations

from typing import Any

import httpx
import pytest

from miro_backend.core.config import settings
from miro_backend.services.miro_client import MiroClient


class DummyAsyncClient:
    """Stub AsyncClient capturing request parameters."""

    def __init__(self, record: dict[str, Any], **kwargs: Any) -> None:
        record["base_url"] = kwargs.get("base_url")
        record["timeout"] = kwargs.get("timeout")
        self.record = record

    async def __aenter__(self) -> "DummyAsyncClient":
        return self

    async def __aexit__(self, *_: object) -> None:
        return None

    async def put(
        self,
        url: str,
        *,
        json: Any | None = None,
        headers: dict[str, str] | None = None,
    ) -> httpx.Response:
        self.record["call"] = ("PUT", url, headers, json)
        return httpx.Response(200)

    async def patch(
        self,
        url: str,
        *,
        json: Any | None = None,
        headers: dict[str, str] | None = None,
    ) -> httpx.Response:
        self.record["call"] = ("PATCH", url, headers, json)
        return httpx.Response(200)

    async def delete(
        self, url: str, *, headers: dict[str, str] | None = None
    ) -> httpx.Response:
        self.record["call"] = ("DELETE", url, headers, None)
        return httpx.Response(204)


@pytest.mark.integration  # type: ignore[misc]
@pytest.mark.asyncio  # type: ignore[misc]
@pytest.mark.parametrize(  # type: ignore[misc]
    ("method", "args", "expected"),
    [
        (
            "create_shape",
            ("b1", "s1", {"x": 1}),
            ("PUT", "/boards/b1/shapes/s1", {"x": 1}),
        ),
        (
            "update_shape",
            ("b1", "s1", {"y": 2}),
            ("PATCH", "/boards/b1/shapes/s1", {"y": 2}),
        ),
        ("delete_shape", ("b1", "s1"), ("DELETE", "/boards/b1/shapes/s1", None)),
        ("update_card", ("c1", {"title": "t"}), ("PATCH", "/cards/c1", {"title": "t"})),
        (
            "create_node",
            ("n1", {"kind": "card"}),
            ("PUT", "/graph/nodes/n1", {"kind": "card"}),
        ),
    ],
)
async def test_miro_client_calls_correct_endpoint(
    monkeypatch: pytest.MonkeyPatch,
    method: str,
    args: tuple[Any, ...],
    expected: tuple[str, str, Any | None],
) -> None:
    record: dict[str, Any] = {}
    monkeypatch.setattr(
        httpx, "AsyncClient", lambda **kw: DummyAsyncClient(record, **kw)
    )
    client = MiroClient(token="tok")
    func = getattr(client, method)
    await func(*args)
    assert record["base_url"] == "https://api.miro.com/v2"
    assert record["timeout"] == settings.http_timeout_seconds
    verb, url, body = expected
    call = record["call"]
    assert call[0] == verb
    assert call[1] == url
    headers = call[2] or {}
    assert headers.get("Authorization") == "Bearer tok"
    assert call[3] == body
