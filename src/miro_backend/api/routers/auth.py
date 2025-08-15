"""Auth endpoints migrated from the C# ``AuthController``."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Header, HTTPException, Response, status

from ...services.user_store import UserStore, get_user_store

router = APIRouter(prefix="/api/auth", tags=["auth"])


# mypy struggles with FastAPI decorators
@router.get("/status", status_code=status.HTTP_200_OK, response_class=Response)  # type: ignore[misc]
def get_status(
    user_id: str | None = Header(default=None, alias="X-User-Id"),
    store: UserStore = Depends(get_user_store),
) -> Response:
    """Return 200 when tokens exist for the provided ``X-User-Id`` header."""

    if user_id is None or user_id.strip() == "":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="X-User-Id header required",
        )
    if store.retrieve(user_id) is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User tokens not found",
        )
    return Response(status_code=status.HTTP_200_OK)
