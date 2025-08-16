"""Tests for HTTPS redirect middleware."""

from fastapi import FastAPI
from fastapi.testclient import TestClient

from miro_backend.core.security import ProxyHttpsRedirectMiddleware


def create_app() -> FastAPI:
    app = FastAPI()
    app.add_middleware(ProxyHttpsRedirectMiddleware)

    @app.get("/")  # type: ignore[misc]
    async def root() -> dict[str, str]:
        return {"status": "ok"}

    return app


def test_http_request_redirects_to_https() -> None:
    """Requests with ``X-Forwarded-Proto: http`` are redirected to HTTPS."""

    client = TestClient(create_app())
    response = client.get(
        "/", headers={"X-Forwarded-Proto": "http"}, follow_redirects=False
    )

    assert response.status_code == 307
    assert response.headers["location"] == "https://testserver/"
