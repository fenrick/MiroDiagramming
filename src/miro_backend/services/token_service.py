"""Utilities for obtaining valid access tokens."""
"""Helpers for ensuring OAuth access tokens remain valid."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from ..models.user import User
from .miro_client import MiroClient

REFRESH_MARGIN = timedelta(seconds=30)

async def get_valid_access_token(
    session: Session, user_id: str, client: MiroClient
) -> str:
    """Return a valid access token for ``user_id``.
    Refreshes the token via ``client`` when the stored one is about to expire.
    The updated token information is persisted by committing ``session``.

    Args:
        session: Active database session.
        user_id: Miro user identifier.
        client: Client used to refresh access tokens.

    Returns:
        A valid access token for the user.

    Raises:
        ValueError: If no user exists for ``user_id``.
    """
    user = session.query(User).filter(User.user_id == user_id).one_or_none()
    if user is None:
        raise ValueError(f"Unknown user_id {user_id!r}")

    expires_at = (
        user.expires_at
        if user.expires_at.tzinfo is not None
        else user.expires_at.replace(tzinfo=timezone.utc)
    )
    if expires_at - datetime.now(timezone.utc) > REFRESH_MARGIN:
        return user.access_token

    tokens = await client.refresh_token(user.refresh_token)
    user.access_token = tokens["access_token"]
    if refresh := tokens.get("refresh_token"):
        user.refresh_token = refresh
    expires_in = int(tokens.get("expires_in", 0))
    user.expires_at = datetime.now(timezone.utc) + timedelta(seconds=expires_in)
    session.commit()
    
    return user.access_token
