"""Router handling client log ingestion."""

from __future__ import annotations

from typing import Sequence

from fastapi import APIRouter, Depends, Request, Response, status
import logfire

from ...core.exceptions import PayloadTooLargeError

from ...models.log_entry import LogEntry
from ...schemas.log_entry import LogEntryIn
from ...services.log_repository import LogRepository, get_log_repository

router = APIRouter(prefix="/api/logs", tags=["logs"])

MAX_LOG_ENTRIES = 1000
MAX_PAYLOAD_BYTES = 1_048_576  # 1 MiB


@router.post("/", status_code=status.HTTP_202_ACCEPTED, response_class=Response)  # type: ignore[misc]
async def capture_logs(
    request: Request,
    entries: Sequence[LogEntryIn],
    repo: LogRepository = Depends(get_log_repository),
) -> Response:
    """Persist a batch of log entries.

    Parameters
    ----------
    request:
        Incoming HTTP request containing the log payload.
    entries:
        Collection of log entries supplied by the client.
    repo:
        Repository used to store entries.
    """

    with logfire.span("capture logs"):
        content_length = request.headers.get("content-length")
        if content_length is not None:
            try:
                body_size = int(content_length)
            except ValueError:
                body_size = len(await request.body())
        else:
            body_size = len(await request.body())

        if body_size > MAX_PAYLOAD_BYTES:
            raise PayloadTooLargeError(
                f"Maximum payload size is {MAX_PAYLOAD_BYTES} bytes"
            )

        if len(entries) > MAX_LOG_ENTRIES:
            logfire.warning(
                "too many log entries", count=len(entries)
            )  # warn when batch exceeds limit
            raise PayloadTooLargeError(
                f"Maximum {MAX_LOG_ENTRIES} log entries per request"
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
        logfire.info(
            "log entries stored", count=len(models)
        )  # event for successful ingestion
        return Response(status_code=status.HTTP_202_ACCEPTED)
