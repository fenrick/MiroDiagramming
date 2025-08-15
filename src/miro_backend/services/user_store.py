"""User storage abstractions."""

from __future__ import annotations

from threading import Lock
from typing import Optional, Protocol

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


_store = InMemoryUserStore()


def get_user_store() -> UserStore:
    """Provide the global user store instance."""

    return _store
