"""Persistence utilities for :class:`LogEntry`."""

from __future__ import annotations

from collections.abc import Sequence

import logfire
from fastapi import Depends
from sqlalchemy.orm import Session

from ..db.session import get_session
from ..models.log_entry import LogEntry
from .repository import Repository


class LogRepository(Repository[LogEntry]):
    """Repository for storing client log entries."""

    def __init__(self, session: Session) -> None:
        super().__init__(session, LogEntry)

    @logfire.instrument("add log entries")  # type: ignore[misc]
    def add_all(self, entries: Sequence[LogEntry]) -> None:
        """Persist multiple log entries in a single transaction."""

        self.session.add_all(entries)
        self.session.commit()
        logfire.info("log entries persisted", count=len(entries))  # event: bulk insert


def get_log_repository(session: Session = Depends(get_session)) -> LogRepository:
    """FastAPI dependency provider for :class:`LogRepository`."""

    return LogRepository(session)
