"""Storage adapter for the official Miro Python SDK.

Implements the minimal storage interface required by the SDK to persist
authorization state using the application's existing database model.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from sqlalchemy.orm import Session

from ..models.user import User
from ..schemas.user_info import UserInfo
from . import crypto


class DbMiroStorage:
    """Database-backed storage compatible with the Miro SDK.

    Notes
    -----
    - The SDK defines a ``Storage`` interface with ``set`` and ``get``.
    - To keep coupling low, this adapter avoids importing SDK types at
      module import time; it accepts and returns ``Any``.
    - ``get`` currently returns ``None``; this is sufficient for using
      the SDK to exchange codes during the callback flow. Follow-ups can
      construct and return a proper SDK ``State`` instance for reuse.
    """

    def __init__(self, session: Session, user_id: str | None = None) -> None:
        self._session = session
        self._user_id = user_id

    def set(self, state: Optional[Any]) -> None:  # noqa: D401 - SDK interface
        """Persist the provided SDK state object to the database."""

        if state is None:
            return
        # Extract fields defensively from the SDK state
        user_id = (
            getattr(state, "user_id", None)
            or getattr(state, "userId", None)
            or self._user_id
        )
        access_token = getattr(state, "access_token", None)
        refresh_token = getattr(state, "refresh_token", None)
        expires_at = getattr(state, "expires_at", None)
        expires_in = getattr(state, "expires_in", None)

        if user_id is None or access_token is None or refresh_token is None:
            return

        if expires_at is None and isinstance(expires_in, (int, float)):
            expires_at = datetime.now(timezone.utc) + timedelta(seconds=int(expires_in))
        if expires_at is None:
            # Default to one hour if not provided
            expires_at = datetime.now(timezone.utc) + timedelta(hours=1)

        record = (
            self._session.query(User).filter(User.user_id == str(user_id)).one_or_none()
        )
        if record is None:
            record = User(
                user_id=str(user_id),
                name=str(user_id),
                access_token=crypto.encrypt(str(access_token)),
                refresh_token=crypto.encrypt(str(refresh_token)),
                expires_at=expires_at,
            )
            self._session.add(record)
        else:
            record.name = str(user_id)
            record.access_token = crypto.encrypt(str(access_token))
            record.refresh_token = crypto.encrypt(str(refresh_token))
            record.expires_at = expires_at
        self._session.commit()
        self._user_id = str(user_id)

    def get(self) -> Optional[Any]:  # noqa: D401 - SDK interface
        """Return the current state for the associated user if available.

        Currently returns ``None`` to indicate no pre-existing state. The
        SDK will proceed with authorization and call ``set`` after
        exchanging the code. A future enhancement can reconstruct and
        return an SDK ``State`` object from the database record.
        """

        return None

    # Convenience for our app to read back what was stored (not an SDK API)
    def to_user_info(self) -> UserInfo | None:
        if not self._user_id:
            return None
        rec = (
            self._session.query(User).filter(User.user_id == self._user_id).one_or_none()
        )
        if rec is None:
            return None
        return UserInfo(
            id=rec.user_id,
            name=rec.name,
            access_token=crypto.decrypt(rec.access_token),
            refresh_token=crypto.decrypt(rec.refresh_token),
            expires_at=rec.expires_at.replace(tzinfo=timezone.utc),
        )

