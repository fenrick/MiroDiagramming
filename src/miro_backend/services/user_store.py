"""User storage abstractions."""

from __future__ import annotations

from threading import Lock
from typing import Optional, Protocol
from datetime import timezone

from fastapi import Depends
from sqlalchemy.orm import Session

from ..db.session import get_session
from ..models.user import User
from ..schemas.user_info import UserInfo


class UserStore(Protocol):
    """Persist and retrieve user authentication details."""

    def retrieve(self, user_id: str) -> Optional[UserInfo]:
        """Return stored info for ``user_id`` or ``None`` if missing."""

    def store(self, info: UserInfo) -> None:
        """Persist ``info`` for later lookup."""


class InMemoryUserStore(UserStore):
    """Thread-safe in-memory implementation of :class:`UserStore`."""

    def __init__(self) -> None:
        self._users: dict[str, UserInfo] = {}
        self._lock = Lock()

    def retrieve(self, user_id: str) -> Optional[UserInfo]:
        with self._lock:
            return self._users.get(user_id)

    def store(self, info: UserInfo) -> None:
        with self._lock:
            self._users[info.id] = info


class DbUserStore(UserStore):
    """Database-backed implementation of :class:`UserStore`."""

    def __init__(self, session: Session) -> None:
        self._session = session

    def retrieve(self, user_id: str) -> Optional[UserInfo]:
        record = self._session.query(User).filter(User.user_id == user_id).one_or_none()
        if record is None:
            return None
        return UserInfo(
            id=record.user_id,
            name=record.name,
            access_token=record.access_token,
            refresh_token=record.refresh_token,
            expires_at=record.expires_at.replace(tzinfo=timezone.utc),
        )

    def store(self, info: UserInfo) -> None:
        record = self._session.query(User).filter(User.user_id == info.id).one_or_none()
        if record is None:
            record = User(
                user_id=info.id,
                name=info.name,
                access_token=info.access_token,
                refresh_token=info.refresh_token,
                expires_at=info.expires_at,
            )
            self._session.add(record)
        else:
            record.name = info.name
            record.access_token = info.access_token
            record.refresh_token = info.refresh_token
            record.expires_at = info.expires_at
        self._session.commit()


def get_user_store(session: Session = Depends(get_session)) -> UserStore:
    """FastAPI dependency provider for :class:`UserStore`."""

    return DbUserStore(session)
