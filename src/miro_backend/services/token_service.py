"""Utilities for obtaining valid access tokens."""

from __future__ import annotations

import asyncio
from datetime import datetime, timedelta, timezone
from typing import cast

from sqlalchemy.orm import Session

from ..models.user import User
from .miro_client import MiroClient
from . import crypto

REFRESH_MARGIN = timedelta(seconds=30)
_locks: dict[str, asyncio.Lock] = {}


async def get_valid_access_token(
    session: Session, user_id: str, client: MiroClient
) -> str:
    """Return a valid access token for ``user_id``.
    Refreshes the token via ``client`` when the stored one is about to expire.
    The updated token information is persisted by committing ``session``.
    Safe for concurrent calls; refreshes are synchronised per user.

    Args:
        session: Active database session.
        user_id: Miro user identifier.
        client: Client used to refresh access tokens.

    Returns:
        A valid access token for the user.

    Raises:
        ValueError: If no user exists for ``user_id``.
    """
    lock = _locks.setdefault(user_id, asyncio.Lock())
    async with lock:
        user = session.query(User).filter(User.user_id == user_id).one_or_none()
        if user is None:
            raise ValueError(f"Unknown user_id {user_id!r}")  # pragma: no cover
        access = crypto.decrypt(user.access_token)
        refresh = crypto.decrypt(user.refresh_token)
        expires_at = (
            user.expires_at
            if user.expires_at.tzinfo is not None
            else user.expires_at.replace(tzinfo=timezone.utc)
        )
        if expires_at - datetime.now(timezone.utc) > REFRESH_MARGIN:
            return access

        tokens = await client.refresh_token(refresh)
        access_new = cast(str, tokens["access_token"])
        user.access_token = crypto.encrypt(access_new)
        if refresh_new := tokens.get("refresh_token"):
            user.refresh_token = crypto.encrypt(refresh_new)
        expires_in = int(tokens.get("expires_in", 0))
        user.expires_at = datetime.now(timezone.utc) + timedelta(seconds=expires_in)
        session.commit()

        return access_new
