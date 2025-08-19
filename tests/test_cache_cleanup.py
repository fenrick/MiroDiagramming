"""Verify expired cache entries are purged."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta
from pathlib import Path
from contextlib import contextmanager
from collections.abc import Iterator
from unittest.mock import MagicMock

import pytest
from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import sessionmaker

from miro_backend.db.session import Base
from miro_backend.models import CacheEntry
from miro_backend.services.cache import purge_expired_cache


def test_purge_expired_cache(tmp_path: Path) -> None:
    """Rows older than the TTL should be deleted."""

    engine = create_engine(
        f"sqlite:///{tmp_path/'cache.db'}", connect_args={"check_same_thread": False}
    )
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine, autoflush=False, autocommit=False)

    old_time = datetime.now(tz=UTC) - timedelta(days=3)
    fresh_time = datetime.now(tz=UTC)
    with Session() as session:
        session.add(CacheEntry(key="old", value={}, created_at=old_time))
        session.add(CacheEntry(key="new", value={}, created_at=fresh_time))
        session.commit()

    deleted = purge_expired_cache(Session, ttl=timedelta(days=2))
    assert deleted == 1

    with Session() as session:
        remaining = {row.key for row in session.query(CacheEntry).all()}
    assert remaining == {"new"}


def test_purge_logs_on_failure(monkeypatch: pytest.MonkeyPatch) -> None:
    """Operational errors should log a warning and return zero."""

    @contextmanager
    def failing_session_factory() -> Iterator[object]:
        class FailingSession:
            bind = "failing-db"

            def execute(self, *_: object, **__: object) -> None:
                raise OperationalError("stmt", {}, RuntimeError())

            def commit(self) -> None:  # pragma: no cover - not reached
                pass

        yield FailingSession()

    warn = MagicMock()
    monkeypatch.setattr("miro_backend.services.cache.logfire.warning", warn)

    deleted = purge_expired_cache(failing_session_factory, ttl=timedelta(hours=1))

    assert deleted == 0
    warn.assert_called_once()
    message, kwargs = warn.call_args
    assert "failed to purge" in message[0]
    assert kwargs["ttl_seconds"] == 3600
    assert kwargs["session"] == "failing-db"
    assert isinstance(kwargs["error"], OperationalError)
