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
from ...core.security import sign_state, verify_state
from ...db.session import get_session
from ...models.user import User
from ...schemas.user_info import UserInfo
from ...services import crypto
from ...services.miro_client import MiroClient, get_miro_client
from ...services.miro_storage import DbMiroStorage
from ...services.user_store import UserStore, get_user_store
from ...services.miro_sdk import get_auth_url_via_sdk
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


@router.get("/login", response_class=RedirectResponse)
def login(
    user_id: str = Query(alias="userId"),
    return_url: str | None = Query(default=None, alias="returnUrl"),
    cfg: OAuthConfig = Depends(get_oauth_config),
) -> RedirectResponse:
    """Redirect the user to Miro's OAuth consent screen."""

    nonce = base64.urlsafe_b64encode(uuid.uuid4().bytes).decode().rstrip("=")
    state = sign_state(cfg.client_secret, nonce, user_id)
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


@router.get("/install", response_class=RedirectResponse)
def install() -> RedirectResponse:
    """Begin OAuth via the official Miro SDK auth URL.

    This entry point is intended for install/first-run flows that do not
    require our custom CSRF ``state``. It redirects the user to Miro's
    authorization page with the configured client and redirect URI.
    """

    url = get_auth_url_via_sdk()
    with logfire.span("oauth install"):
        logfire.info("redirecting to miro install auth")
    return RedirectResponse(url)


@router.get("/callback", response_class=RedirectResponse)
async def callback(
    code: str,
    state: str | None = Query(default=None),
    client: MiroClient = Depends(get_miro_client),
    store: UserStore = Depends(get_user_store),
    cfg: OAuthConfig = Depends(get_oauth_config),
    session: Session = Depends(get_session),
) -> RedirectResponse:
    """Exchange the code for tokens and store them."""

    # If a non-empty state is provided, verify it. For install flows
    # using the SDK or Miro app-install URL, state may be absent.
    if state and state.strip():
        try:
            _, user_id = verify_state(cfg.client_secret, state)
        except ValueError:
            logfire.warning("invalid oauth state", state=state)
            raise BadRequestError("Invalid state")
    else:
        # Without a verified state we can't identify the initiating
        # user, so we will derive identity from the token exchange
        # result and store under that id. Until then, use a placeholder.
        user_id = "unknown"
    with logfire.span("oauth callback", user_id=user_id):
        tokens: dict[str, str | int]
        if settings.use_miro_sdk:
            try:
                import miro_api  # type: ignore

                storage = DbMiroStorage(session=session)
                miro = miro_api.Miro(  # type: ignore[attr-defined]
                    client_id=cfg.client_id,
                    client_secret=cfg.client_secret,
                    redirect_url=cfg.redirect_uri,
                    storage=storage,
                )
                # SDK call is synchronous
                miro.exchange_code_for_access_token(code)  # type: ignore[attr-defined]
                info = storage.to_user_info()
                if info is None:
                    raise RuntimeError("SDK storage did not persist tokens")
                tokens = {
                    "access_token": info.access_token,
                    "refresh_token": info.refresh_token,
                    # expires_in used below to compute expires_at
                    "expires_in": int(
                        (info.expires_at - datetime.now(timezone.utc)).total_seconds()
                    ),
                    "user_id": info.id,
                }
            except Exception as exc:
                logfire.warning("miro sdk exchange failed; falling back", error=str(exc))
                tokens = await client.exchange_code(
                    code,
                    cfg.redirect_uri,
                    cfg.token_url,
                    cfg.client_id,
                    cfg.client_secret,
                    cfg.timeout_seconds,
                )
        else:
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
    # If we didn't have a verified user_id from state, try to infer it
    # from the token response (Miro returns user_id in many flows).
    if user_id == "unknown":
        inferred = tokens.get("user_id") or tokens.get("userId")
        if isinstance(inferred, str) and inferred:
            user_id = inferred
        else:
            # As a last resort, persist under a deterministic placeholder
            # to avoid blowing up; callers should repair/associate later.
            user_id = "miro-user"

    user = session.query(User).filter_by(user_id=user_id).one_or_none()
    if user is None:
        user = User(user_id=user_id, name=user_id)
        session.add(user)
    user.name = user_id
    user.access_token = crypto.encrypt(tokens["access_token"])
    user.refresh_token = crypto.encrypt(tokens["refresh_token"])
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
