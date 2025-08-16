"""Security-related middleware and helpers."""

from __future__ import annotations

from fastapi import FastAPI, Request
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import RedirectResponse, Response


class ProxyHttpsRedirectMiddleware(BaseHTTPMiddleware):  # type: ignore[misc]
    """Redirect HTTP requests to HTTPS using ``X-Forwarded-Proto``."""

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        proto = request.headers.get("X-Forwarded-Proto")
        if proto == "http":
            url = request.url.replace(scheme="https")
            return RedirectResponse(str(url), status_code=307)
        return await call_next(request)


def setup_security(app: FastAPI) -> None:
    """Register security middleware."""

    app.add_middleware(ProxyHttpsRedirectMiddleware)
