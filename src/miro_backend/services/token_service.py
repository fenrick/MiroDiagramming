"""Helpers for ensuring OAuth access tokens remain valid."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from .miro_client import MiroClient
from ..models.user import User


async def get_valid_access_token(
    session: Session, user_id: str, client: MiroClient
) -> str:
    """Return a valid access token for ``user_id``.

    Refresh the user's tokens when expired using ``client.refresh_token``.
    """
    user = session.query(User).filter(User.user_id == user_id).one()
    expires_at = user.expires_at.replace(tzinfo=timezone.utc)
    now = datetime.now(timezone.utc)
    if expires_at <= now:
        tokens = await client.refresh_token(user.refresh_token)
        user.access_token = tokens["access_token"]
        user.refresh_token = tokens["refresh_token"]
        expires_in = int(tokens.get("expires_in", 0))
        user.expires_at = now + timedelta(seconds=expires_in)
        session.commit()
    return user.access_token
