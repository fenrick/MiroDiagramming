"""Idempotency utilities."""

from __future__ import annotations

import asyncio
from datetime import UTC, datetime, timedelta

import logfire
from sqlalchemy import delete
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import Session, sessionmaker

from ..db.session import SessionLocal
from ..models import Idempotency


def purge_expired_idempotency(
    session_factory: sessionmaker[Session] = SessionLocal,
    ttl: timedelta = timedelta(hours=48),
) -> int:
    """Delete idempotency rows older than ``ttl``.

    Args:
        session_factory: Factory for database sessions.
        ttl: Maximum age for idempotency records.

    Returns:
        Number of rows removed.
    """

    cutoff = datetime.now(tz=UTC) - ttl
    with session_factory() as session:
        try:
            result = session.execute(
                delete(Idempotency).where(Idempotency.created_at < cutoff)
            )
            session.commit()
        except OperationalError:
            return 0
        return result.rowcount or 0


async def cleanup_idempotency() -> None:
    """Periodically purge expired idempotency rows."""

    try:
        while True:
            deleted = await asyncio.to_thread(purge_expired_idempotency)
            if deleted:
                logfire.info("removed stale idempotency rows", extra={"count": deleted})
            await asyncio.sleep(60 * 60 * 24)
    except asyncio.CancelledError:
        logfire.info("idempotency cleanup stopped")
        raise
