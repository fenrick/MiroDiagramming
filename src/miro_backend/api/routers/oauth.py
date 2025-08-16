"""OAuth login and callback endpoints."""

from __future__ import annotations

import base64
import uuid
from datetime import datetime, timedelta, timezone
from urllib.parse import quote

from fastapi import APIRouter, Depends, Query
from fastapi.responses import RedirectResponse
from pydantic import BaseModel

import logfire

from ...core.config import settings
from ...core.exceptions import BadRequestError
from ...db.session import get_session
from ...models.user import User
from ...schemas.user_info import UserInfo
from ...services.miro_client import MiroClient, get_miro_client
from ...services.user_store import UserStore, get_user_store
from sqlalchemy.orm import Session

router = APIRouter(prefix="/oauth", tags=["oauth"])


class OAuthConfig(BaseModel):
    """Configuration for OAuth integration."""

    auth_base: str = "https://miro.com"
    client_id: str = ""
    client_secret: str = ""
    redirect_uri: str = ""
    scope: str = "boards:read boards:write"
    token_url: str = "https://api.miro.com/v1/oauth/token"
    timeout_seconds: float | None = None


def get_oauth_config() -> OAuthConfig:
    """Populate OAuth configuration from application settings."""

    return OAuthConfig(
        client_id=settings.client_id,
        client_secret=settings.client_secret.get_secret_value(),
        redirect_uri=settings.oauth_redirect_uri,
        scope="boards:read boards:write",
        token_url="https://api.miro.com/v1/oauth/token",
        timeout_seconds=settings.http_timeout_seconds,
    )


@router.get("/login", response_class=RedirectResponse)  # type: ignore[misc]
def login(
    user_id: str = Query(alias="userId"),
    return_url: str | None = Query(default=None, alias="returnUrl"),
    cfg: OAuthConfig = Depends(get_oauth_config),
) -> RedirectResponse:
    """Redirect the user to Miro's OAuth consent screen."""

    state = (
        base64.urlsafe_b64encode(uuid.uuid4().bytes).decode().rstrip("=")
        + ":"
        + user_id
    )
    url = (
        f"{cfg.auth_base}/oauth/authorize"
        "?response_type=code"
        f"&client_id={quote(cfg.client_id)}"
        f"&redirect_uri={quote(cfg.redirect_uri)}"
        f"&state={quote(state)}"
        f"&scope={quote(cfg.scope)}"
    )
    with logfire.span("oauth login"):
        logfire.info("redirecting for oauth", user_id=user_id)  # event before redirect
    return RedirectResponse(url)


@router.get("/callback", response_class=RedirectResponse)  # type: ignore[misc]
async def callback(
    code: str,
    state: str,
    client: MiroClient = Depends(get_miro_client),
    store: UserStore = Depends(get_user_store),
    cfg: OAuthConfig = Depends(get_oauth_config),
    session: Session = Depends(get_session),
) -> RedirectResponse:
    """Exchange the code for tokens and store them."""

    parts = state.split(":", 1)
    if len(parts) != 2 or not parts[1]:
        logfire.warning(
            "invalid oauth state", state=state
        )  # warn about malformed state
        raise BadRequestError("Invalid state")
    user_id = parts[1]
    with logfire.span("oauth callback", user_id=user_id):
        tokens = await client.exchange_code(
            code,
            cfg.redirect_uri,
            cfg.token_url,
            cfg.client_id,
            cfg.client_secret,
            cfg.timeout_seconds,
        )
    expires_at = datetime.now(timezone.utc) + timedelta(
        seconds=int(tokens["expires_in"])
    )
    user = session.query(User).filter_by(user_id=user_id).one_or_none()
    if user is None:
        user = User(user_id=user_id, name=user_id)
        session.add(user)
    user.name = user_id
    user.access_token = tokens["access_token"]
    user.refresh_token = tokens["refresh_token"]
    user.expires_at = expires_at
    session.commit()
    store.store(
        UserInfo(
            id=user_id,
            name=user_id,
            access_token=tokens["access_token"],
            refresh_token=tokens["refresh_token"],
            expires_at=expires_at,
        )
    )
    logfire.info(
        "oauth tokens stored", user_id=user_id
    )  # event after persisting tokens
    return RedirectResponse("/app.html")
