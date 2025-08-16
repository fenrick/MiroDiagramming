from collections.abc import Iterator
from datetime import datetime, timedelta, timezone
from typing import Any, cast

import pytest
from sqlalchemy.orm import Session

from miro_backend.db.session import Base, SessionLocal, engine
from miro_backend.models.user import User
from miro_backend.services.token_service import get_valid_access_token


@pytest.fixture(autouse=True)  # type: ignore[misc]
def setup_db() -> Iterator[None]:
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture  # type: ignore[misc]
def session() -> Iterator[Session]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class DummyClient:
    def __init__(self, response: dict[str, Any]) -> None:
        self.response = response
        self.called_with: list[str] = []

    async def refresh_token(self, refresh_token: str) -> dict[str, Any]:
        self.called_with.append(refresh_token)
        return self.response


@pytest.mark.asyncio()  # type: ignore[misc]
async def test_returns_existing_token_when_not_expiring(session: Session) -> None:
    user = User(
        user_id="u1",
        name="Test",
        access_token="tok",
        refresh_token="ref",
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=5),
    )
    session.add(user)
    session.commit()
    client = DummyClient({})

    token = await get_valid_access_token(session, "u1", cast(Any, client))

    assert token == "tok"
    assert client.called_with == []


@pytest.mark.asyncio()  # type: ignore[misc]
async def test_refreshes_token_when_expiring(session: Session) -> None:
    user = User(
        user_id="u2",
        name="Test",
        access_token="old",
        refresh_token="r1",
        expires_at=datetime.now(timezone.utc) + timedelta(seconds=1),
    )
    session.add(user)
    session.commit()

    response = {
        "access_token": "new",
        "refresh_token": "r2",
        "expires_in": 60,
    }
    client = DummyClient(response)

    token = await get_valid_access_token(session, "u2", cast(Any, client))

    assert token == "new"
    refreshed = session.query(User).filter_by(user_id="u2").one()
    assert refreshed.access_token == "new"
    assert refreshed.refresh_token == "r2"
    assert refreshed.expires_at.replace(tzinfo=timezone.utc) > datetime.now(
        timezone.utc
    )
    assert client.called_with == ["r1"]
