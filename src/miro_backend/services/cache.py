"""Cache maintenance utilities."""

from __future__ import annotations

import asyncio
from datetime import UTC, datetime, timedelta

import logfire
from sqlalchemy import delete
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session, sessionmaker

from ..core.config import settings
from ..db.session import SessionLocal
from ..models import CacheEntry


def purge_expired_cache(
    session_factory: sessionmaker[Session] = SessionLocal,
    ttl: timedelta = timedelta(hours=24),
) -> int:
    """Delete cache rows older than ``ttl``.

    Args:
        session_factory: Factory for database sessions.
        ttl: Maximum age for cache records.

    Returns:
        Number of rows removed.
    """

    cutoff = datetime.now(tz=UTC) - ttl
    with session_factory() as session:
        try:
            result = session.execute(
                delete(CacheEntry).where(CacheEntry.created_at < cutoff)
            )
            session.commit()
        except OperationalError as exc:  # pragma: no cover - log and continue
            logfire.warning(
                "failed to purge expired cache rows",
                ttl_seconds=int(ttl.total_seconds()),
                session=str(session.bind),
                error=exc,
            )
            return 0
        return result.rowcount or 0


async def cleanup_cache() -> None:
    """Periodically purge expired cache rows."""

    try:
        while True:
            ttl = timedelta(seconds=settings.cache_ttl_seconds)
            deleted = await asyncio.to_thread(purge_expired_cache, ttl=ttl)
            if deleted:
                logfire.info("removed stale cache rows", extra={"count": deleted})
            await asyncio.sleep(settings.cache_cleanup_seconds)
    except asyncio.CancelledError:  # pragma: no cover - shutdown path
        logfire.info("cache cleanup stopped")
        raise
