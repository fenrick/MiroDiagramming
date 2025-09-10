"""Integration helpers for the official Miro Python SDK.

This module provides thin wrappers so the rest of the codebase can
progressively adopt the SDK without large refactors. Importing the SDK
is done lazily to keep tests decoupled when the package isn't installed.
"""

from __future__ import annotations

from urllib.parse import quote

from ..core.config import settings


def get_auth_url_via_sdk() -> str:
    """Return the Miro authorization URL using the SDK if available.

    Falls back to constructing the standard OAuth authorize URL if the
    SDK is not installed. This does not include an application-defined
    CSRF state value; use the existing ``/oauth/login`` flow if state is
    required for your scenario.
    """

    try:
        import miro_api  # type: ignore

        miro = miro_api.Miro(  # type: ignore[attr-defined]
            client_id=settings.client_id,
            client_secret=settings.client_secret.get_secret_value(),
            redirect_url=settings.oauth_redirect_uri,
        )
        return str(miro.auth_url)
    except Exception:
        # Fallback to building an authorize URL compatible with our config
        base = settings.oauth_auth_base.rstrip("/")
        # settings.oauth_auth_base may already include the path; handle both
        if not base.endswith("/oauth/authorize"):
            base = f"{base}/oauth/authorize"
        url = (
            f"{base}?response_type=code"
            f"&client_id={quote(settings.client_id)}"
            f"&redirect_uri={quote(settings.oauth_redirect_uri)}"
            f"&scope={quote(settings.oauth_scope)}"
        )
        return url

