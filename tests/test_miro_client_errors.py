import httpx
import pytest
from datetime import datetime, timedelta, timezone

from miro_backend.services.errors import HttpError, RateLimitedError
from miro_backend.services.miro_client import MiroClient


@pytest.mark.asyncio()  # type: ignore[misc]
async def test_raise_for_status_rate_limited() -> None:
    client = MiroClient()
    response = httpx.Response(429, headers={"Retry-After": "1"})
    with pytest.raises(RateLimitedError) as exc:
        client._raise_for_status(response)
    assert exc.value.retry_after == 1
    assert exc.value.status == 429


@pytest.mark.asyncio()  # type: ignore[misc]
async def test_raise_for_status_rate_limited_http_date(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    client = MiroClient()
    fixed_now = datetime(2024, 1, 1, tzinfo=timezone.utc)

    class FixedDateTime(datetime):
        @classmethod
        def now(cls, tz: timezone | None = None) -> datetime:  # type: ignore[override]
            return fixed_now

    monkeypatch.setattr("miro_backend.services.miro_client.datetime", FixedDateTime)
    retry_at = fixed_now + timedelta(seconds=5)
    header = retry_at.strftime("%a, %d %b %Y %H:%M:%S GMT")
    response = httpx.Response(429, headers={"Retry-After": header})
    with pytest.raises(RateLimitedError) as exc:
        client._raise_for_status(response)
    assert exc.value.retry_after == 5.0
    assert exc.value.status == 429


@pytest.mark.asyncio()  # type: ignore[misc]
async def test_raise_for_status_server_error() -> None:
    client = MiroClient()
    response = httpx.Response(503)
    with pytest.raises(HttpError) as exc:
        client._raise_for_status(response)
    assert exc.value.status == 503
