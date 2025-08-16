from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest

from miro_backend.db.session import Base, SessionLocal, engine
from miro_backend.models.user import User
from miro_backend.services.token_service import get_valid_access_token


class StubClient:
    async def refresh_token(self, refresh_token: str) -> dict[str, str | int]:
        return {
            "access_token": "new_a",
            "refresh_token": "new_r",
            "expires_in": 3600,
        }


@pytest.mark.asyncio()  # type: ignore[misc]
async def test_get_valid_access_token_refreshes_expired_tokens() -> None:
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    try:
        expired_at = datetime.now(timezone.utc) - timedelta(seconds=1)
        session.add(
            User(
                user_id="u1",
                name="n",
                access_token="old_a",
                refresh_token="old_r",
                expires_at=expired_at,
            )
        )
        session.commit()

        token = await get_valid_access_token(session, "u1", StubClient())

        assert token == "new_a"
        row = session.query(User).filter_by(user_id="u1").one()
        assert row.access_token == "new_a"
        assert row.refresh_token == "new_r"
        assert row.expires_at.replace(tzinfo=timezone.utc) > expired_at
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)
