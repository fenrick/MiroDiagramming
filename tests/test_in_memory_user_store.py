"""Tests for the in-memory user store."""

from __future__ import annotations

from datetime import datetime, timezone

from miro_backend.schemas.user_info import UserInfo
from miro_backend.services.user_store import InMemoryUserStore


def test_store_and_retrieve_user_info() -> None:
    """Stored user info should be retrievable by its identifier."""

    store = InMemoryUserStore()
    assert store.retrieve("u1") is None

    info = UserInfo(
        id="u1",
        name="Test",
        access_token="a",
        refresh_token="r",
        expires_at=datetime.now(timezone.utc),
    )
    store.store(info)
    assert store.retrieve("u1") == info
