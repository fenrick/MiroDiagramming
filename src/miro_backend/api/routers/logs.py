"""Router handling client log ingestion."""

from __future__ import annotations

from typing import Sequence

from fastapi import APIRouter, Depends, Response, status
import logfire

from ...core.exceptions import PayloadTooLargeError

from ...models.log_entry import LogEntry
from ...schemas.log_entry import LogEntryIn
from ...services.log_repository import LogRepository, get_log_repository

router = APIRouter(prefix="/api/logs", tags=["logs"])

MAX_BATCH = 100


@router.post("/", status_code=status.HTTP_202_ACCEPTED, response_class=Response)  # type: ignore[misc]
def capture_logs(
    entries: Sequence[LogEntryIn],
    repo: LogRepository = Depends(get_log_repository),
) -> Response:
    """Persist a batch of log entries.

    Parameters
    ----------
    entries:
        Collection of log entries supplied by the client.
    repo:
        Repository used to store entries.
    """

    with logfire.span("capture logs"):
        if len(entries) > MAX_BATCH:
            logfire.warning(
                "too many log entries", count=len(entries)
            )  # warn when batch exceeds limit
            raise PayloadTooLargeError("too many log entries")

        models = [
            LogEntry(
                timestamp=e.timestamp,
                level=e.level,
                message=e.message,
                context=e.context,
            )
            for e in entries
        ]
        repo.add_all(models)
        logfire.info(
            "log entries stored", count=len(models)
        )  # event for successful ingestion
        return Response(status_code=status.HTTP_202_ACCEPTED)
