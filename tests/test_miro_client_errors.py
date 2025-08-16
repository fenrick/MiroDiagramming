import pytest
import httpx

from miro_backend.services.miro_client import MiroClient
from miro_backend.services.errors import HttpError, RateLimitedError


@pytest.mark.asyncio()  # type: ignore[misc]
async def test_raise_for_status_rate_limited() -> None:
    client = MiroClient()
    response = httpx.Response(429, headers={"Retry-After": "1"})
    with pytest.raises(RateLimitedError) as exc:
        client._raise_for_status(response)
    assert exc.value.retry_after == 1
    assert exc.value.status == 429


@pytest.mark.asyncio()  # type: ignore[misc]
async def test_raise_for_status_server_error() -> None:
    client = MiroClient()
    response = httpx.Response(503)
    with pytest.raises(HttpError) as exc:
        client._raise_for_status(response)
    assert exc.value.status == 503
