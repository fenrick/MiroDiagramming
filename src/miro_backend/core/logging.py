"""Application logging configuration."""

from __future__ import annotations

import uuid

import logfire
from fastapi import FastAPI, Request
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response


class RequestIdMiddleware(BaseHTTPMiddleware):
    """Attach a correlation ID to each request and log context."""

    @logfire.instrument("request id middleware")
    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        with logfire.set_baggage(request_id=request_id):  # span to attach request id
            response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response


@logfire.instrument("configure logging")
def configure_logging() -> None:
    """Configure logfire and database instrumentation."""
    from .config import settings

    logfire.configure(
        send_to_logfire=settings.logfire_send_to_logfire,
        service_name=settings.logfire_service_name,
    )
    from ..db.session import engine  # imported lazily

    logfire.instrument_sqlite3()
    logfire.instrument_sqlalchemy(engine)


@logfire.instrument("setup fastapi")
def setup_fastapi(app: FastAPI) -> None:
    """Instrument FastAPI and register request ID middleware."""

    logfire.instrument_fastapi(app)
    app.add_middleware(RequestIdMiddleware)
