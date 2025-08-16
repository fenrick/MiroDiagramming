"""Cache lookup endpoints for board metadata."""

from __future__ import annotations

from typing import Any, cast

from fastapi import APIRouter, Depends, status
import logfire

from ...core.exceptions import NotFoundError
from sqlalchemy.orm import Session

from ...db.session import get_session
from ...models import CacheEntry
from ...services.repository import Repository

router = APIRouter(prefix="/api/cache", tags=["cache"])


@router.get("/{board_id}", status_code=status.HTTP_200_OK)  # type: ignore[misc]
def get_board_cache(
    board_id: str, session: Session = Depends(get_session)
) -> dict[str, Any]:
    """Return cached board state for ``board_id``."""

    with logfire.span("get board cache"):
        if board_id.strip() == "":
            logfire.warning("board id empty")  # warn when identifier is blank
            raise NotFoundError("Board not found")
        repo: Repository[CacheEntry] = Repository(session, CacheEntry)
        state = repo.get_board_state(board_id)
        if state is None:
            logfire.warning(
                "board cache missing", board_id=board_id
            )  # warn when cache miss occurs
            raise NotFoundError("Board not found")
        logfire.info(
            "board cache hit", board_id=board_id
        )  # event when cache lookup succeeds
        return cast(dict[str, Any], state)
