from __future__ import annotations

import asyncio
import gc
import weakref
from datetime import datetime, timedelta, timezone
from typing import Any, Iterator, cast

import pytest
from sqlalchemy.orm import Session

from miro_backend.db.session import Base, SessionLocal, engine
from miro_backend.models.user import User
from miro_backend.services import token_service
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


@pytest.mark.asyncio()  # type: ignore[misc]
async def test_refresh_token_called_once_concurrently(session: Session) -> None:
    user = User(
        user_id="u3",
        name="Test",
        access_token="old",
        refresh_token="ref",
        expires_at=datetime.now(timezone.utc) + timedelta(seconds=1),
    )
    session.add(user)
    session.commit()

    class SlowClient:
        def __init__(self) -> None:
            self.calls: list[str] = []

        async def refresh_token(self, refresh_token: str) -> dict[str, Any]:
            self.calls.append(refresh_token)
            await asyncio.sleep(0.1)
            return {"access_token": "new", "expires_in": 60}

    client = SlowClient()
    tokens = await asyncio.gather(
        *(get_valid_access_token(session, "u3", cast(Any, client)) for _ in range(5))
    )

    assert tokens == ["new"] * 5
    assert client.calls == ["ref"]


@pytest.mark.asyncio()  # type: ignore[misc]
async def test_locks_cleaned_and_recreated(session: Session) -> None:
    user = User(
        user_id="u_lock",
        name="Test",
        access_token="old",  # will trigger refresh
        refresh_token="ref",
        expires_at=datetime.now(timezone.utc) + timedelta(seconds=1),
    )
    session.add(user)
    session.commit()

    # Simulate existing lock then garbage-collect it
    lock = asyncio.Lock()
    token_service._locks["u_lock"] = lock
    ref = weakref.ref(lock)
    del lock
    gc.collect()
    assert ref() is None
    assert "u_lock" not in token_service._locks

    class SlowClient:
        def __init__(self) -> None:
            self.calls: list[str] = []

        async def refresh_token(self, refresh_token: str) -> dict[str, Any]:
            self.calls.append(refresh_token)
            await asyncio.sleep(0.01)
            return {"access_token": "new", "expires_in": 60}

    client = SlowClient()
    tokens = await asyncio.gather(
        *(
            get_valid_access_token(session, "u_lock", cast(Any, client))
            for _ in range(5)
        )
    )

    assert tokens == ["new"] * 5
    assert client.calls == ["ref"]
