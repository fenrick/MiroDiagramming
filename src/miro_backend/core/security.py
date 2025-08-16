"""Security-related middleware and helpers."""

from __future__ import annotations

import base64
import hashlib
import hmac
from fastapi import FastAPI, Request
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import RedirectResponse, Response


def sign_state(secret: str, nonce: str, user_id: str) -> str:
    """Return a signed, base64url-encoded OAuth state value.

    Args:
        secret: Client secret used as the HMAC key.
        nonce: Random nonce to prevent replay attacks.
        user_id: Identifier of the user starting the flow.

    Returns:
        A state string suitable for transmission in the OAuth request.
    """

    message = f"{nonce}:{user_id}"
    sig = hmac.new(secret.encode(), message.encode(), hashlib.sha256).hexdigest()
    data = f"{message}:{sig}".encode()
    return base64.urlsafe_b64encode(data).decode().rstrip("=")


def verify_state(secret: str, state: str) -> tuple[str, str]:
    """Verify an OAuth state value and return the contained parts.

    Args:
        secret: Client secret used as the HMAC key.
        state: Base64url-encoded state value from the OAuth callback.

    Returns:
        A tuple of ``(nonce, user_id)`` if the state is valid.

    Raises:
        ValueError: If the state cannot be decoded or the signature is invalid.
    """

    try:
        decoded = base64.urlsafe_b64decode(state + "=" * (-len(state) % 4)).decode()
    except Exception as exc:  # pragma: no cover - decode errors are handled uniformly
        raise ValueError("Invalid state encoding") from exc
    parts = decoded.split(":")
    if len(parts) != 3:
        raise ValueError("Invalid state format")
    nonce, user_id, sig = parts
    expected = hmac.new(
        secret.encode(), f"{nonce}:{user_id}".encode(), hashlib.sha256
    ).hexdigest()
    if not hmac.compare_digest(sig, expected):
        raise ValueError("Invalid state signature")
    return nonce, user_id


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
