"""Integration test verifying OAuth callback persistence."""

from __future__ import annotations

from collections.abc import AsyncIterator, Iterator
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Optional

import httpx
import pytest
from fastapi import FastAPI
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from miro_backend.api.routers import oauth
from miro_backend.db.session import Base, get_session
from miro_backend.main import app
from miro_backend.models.user import User
from miro_backend.schemas.user_info import UserInfo
from miro_backend.services.miro_client import MiroClient
from miro_backend.services.user_store import UserStore, get_user_store


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Run startup and shutdown events for ``app``."""

    async with app.router.lifespan_context(app):
        yield


class DBUserStore(UserStore):  # type: ignore[misc]
    """Persist ``UserInfo`` records using SQLAlchemy."""

    def __init__(self, factory: sessionmaker[Session]) -> None:
        self._factory = factory

    def retrieve(self, user_id: str) -> Optional[UserInfo]:
        with self._factory() as session:
            row = session.query(User).filter_by(user_id=user_id).first()
            if row is None:
                return None
            return UserInfo(
                id=row.user_id,
                name=row.name,
                access_token=row.access_token,
                refresh_token=row.refresh_token,
                expires_at=row.expires_at,
            )

    def store(self, info: UserInfo) -> None:
        with self._factory() as session:
            user = session.query(User).filter_by(user_id=info.id).one_or_none()
            if user is None:
                user = User(user_id=info.id, name=info.name)
                session.add(user)
            user.name = info.name
            user.access_token = info.access_token
            user.refresh_token = info.refresh_token
            user.expires_at = info.expires_at
            session.commit()


class StubMiroClient(MiroClient):  # type: ignore[misc]
    """Stubbed Miro client returning fixed tokens."""

    async def exchange_code(
        self,
        code: str,
        redirect_uri: str,
        token_url: str,
        client_id: str,
        client_secret: str,
        timeout_seconds: float | None = None,
    ) -> dict[str, int | str]:
        return {
            "access_token": "access_token",
            "refresh_token": "refresh_token",
            "expires_in": 3600,
        }


@pytest.mark.integration  # type: ignore[misc]
@pytest.mark.asyncio  # type: ignore[misc]
async def test_callback_persists_tokens(tmp_path: Path) -> None:
    """``/oauth/callback`` should persist tokens to the database."""

    db_file = tmp_path / "test.db"
    engine = create_engine(
        f"sqlite:///{db_file}", connect_args={"check_same_thread": False}
    )
    Base.metadata.create_all(bind=engine)
    factory: sessionmaker[Session] = sessionmaker(
        bind=engine, autoflush=False, autocommit=False
    )

    def _get_session() -> Iterator[Session]:
        session = factory()
        try:
            yield session
        finally:
            session.close()

    store = DBUserStore(factory)
    app.dependency_overrides[get_session] = _get_session
    app.dependency_overrides[get_user_store] = lambda: store
    app.dependency_overrides[oauth.get_miro_client] = lambda: StubMiroClient()

    try:
        async with lifespan(app):
            transport = httpx.ASGITransport(app=app)
            async with httpx.AsyncClient(
                transport=transport, base_url="http://test"
            ) as client:
                res = await client.get(
                    "/oauth/callback", params={"code": "c", "state": "x:u1"}
                )
        assert res.status_code == 307
        assert res.headers["location"] == "/app.html"

        with factory() as session:
            user = session.query(User).filter_by(user_id="u1").first()
            assert user is not None
            assert user.access_token == "access_token"
            assert user.refresh_token == "refresh_token"
            expected = (datetime.now(timezone.utc) + timedelta(seconds=3600)).replace(
                tzinfo=None
            )
            assert abs((user.expires_at - expected).total_seconds()) < 5
    finally:
        app.dependency_overrides.clear()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()
        if db_file.exists():
            db_file.unlink()
