"""Application-specific exception types and handlers."""

from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from starlette import status

import logfire


class ErrorResponse(BaseModel):
    """Schema for error responses returned by handlers."""

    code: str
    message: str


class AppError(Exception):
    """Base class for application errors with HTTP semantics."""

    status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR
    code: str = "server_error"
    message: str = "Internal server error"

    def __init__(self, message: str | None = None) -> None:
        super().__init__(message or self.message)
        if message:
            self.message = message


class BadRequestError(AppError):
    status_code = status.HTTP_400_BAD_REQUEST
    code = "bad_request"


class UnauthorizedError(AppError):
    status_code = status.HTTP_401_UNAUTHORIZED
    code = "unauthorized"


class ForbiddenError(AppError):
    status_code = status.HTTP_403_FORBIDDEN
    code = "forbidden"


class NotFoundError(AppError):
    status_code = status.HTTP_404_NOT_FOUND
    code = "not_found"


class ConflictError(AppError):
    status_code = status.HTTP_409_CONFLICT
    code = "conflict"


class PayloadTooLargeError(AppError):
    status_code = status.HTTP_413_REQUEST_ENTITY_TOO_LARGE
    code = "payload_too_large"


@logfire.instrument("handle app error")
async def handle_app_error(_: Request, exc: Exception) -> JSONResponse:
    """Convert :class:`AppError` instances into JSON responses."""

    # log structured details for the raised application error
    if not isinstance(exc, AppError):  # safety guard, registered for AppError only
        raise exc
    logfire.warning(exc.message, code=exc.code)
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(code=exc.code, message=exc.message).model_dump(),
    )


def add_exception_handlers(app: FastAPI) -> None:
    """Register handlers for custom exceptions."""

    app.add_exception_handler(AppError, handle_app_error)
