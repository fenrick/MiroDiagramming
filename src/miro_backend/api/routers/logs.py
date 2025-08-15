"""Router handling client log ingestion."""

from __future__ import annotations

from typing import Sequence

from fastapi import APIRouter, Depends, HTTPException, Response, status

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

    if len(entries) > MAX_BATCH:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="too many log entries",
        )

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
    return Response(status_code=status.HTTP_202_ACCEPTED)
