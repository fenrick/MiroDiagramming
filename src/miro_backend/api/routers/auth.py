"""Auth endpoints migrated from the C# ``AuthController``."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Header, Response, status

import logfire

from ...core.exceptions import BadRequestError, NotFoundError

from ...services.user_store import UserStore, get_user_store

router = APIRouter(prefix="/api/auth", tags=["auth"])


# mypy struggles with FastAPI decorators
@router.get("/status", status_code=status.HTTP_200_OK, response_class=Response)  # type: ignore[misc]
def get_status(
    user_id: str | None = Header(default=None, alias="X-User-Id"),
    store: UserStore = Depends(get_user_store),
    debug_auth: str | None = Header(default=None, alias="X-Debug-Auth"),
) -> Response:
    """Return 200 when tokens exist for the provided ``X-User-Id`` header."""
    with logfire.span("auth status"):
        if user_id is None or user_id.strip() == "":
            logfire.warning("missing user id header")  # warn about absent user id
            raise BadRequestError("X-User-Id header required")
        if debug_auth == "expired":
            raise NotFoundError("User tokens not found")
        if store.retrieve(user_id) is None:
            logfire.warning(
                "user tokens not found", user_id=user_id
            )  # warn about missing tokens
            raise NotFoundError("User tokens not found")
        logfire.info("tokens verified", user_id=user_id)  # event when tokens exist
        return Response(status_code=status.HTTP_200_OK)
