"""Router handling client log ingestion."""

from __future__ import annotations

from typing import Sequence

from fastapi import APIRouter, Depends, Request, Response, status
import logfire
from prometheus_client import Counter, Histogram

from ...core.config import settings
from ...core.exceptions import PayloadTooLargeError

from ...models.log_entry import LogEntry
from ...schemas.log_entry import LogEntryIn
from ...services.log_repository import LogRepository, get_log_repository

router = APIRouter(prefix="/api/logs", tags=["logs"])


logs_ingested_total = Counter(
    "logs_ingested_total",
    "Number of log entries ingested",
    registry=None,
)

log_batch_size_bytes = Histogram(
    "log_batch_size_bytes",
    "Size of log batches in bytes",
    buckets=(256, 1024, 4096, 16384, 65536, 262144, 1048576),
    registry=None,
)


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

        if body_size > settings.log_max_payload_bytes:
            raise PayloadTooLargeError(
                f"Maximum payload size is {settings.log_max_payload_bytes} bytes"
            )

        if len(entries) > settings.log_max_entries:
            logfire.warning(
                "too many log entries", count=len(entries)
            )  # warn when batch exceeds limit
            raise PayloadTooLargeError(
                f"Maximum {settings.log_max_entries} log entries per request"
            )

        logs_ingested_total.inc(len(entries))
        log_batch_size_bytes.observe(body_size)

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
