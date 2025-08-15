"""Cache lookup endpoints for board metadata."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
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

    if board_id.strip() == "":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Board not found"
        )
    repo: Repository[CacheEntry] = Repository(session, CacheEntry)
    state = repo.get_board_state(board_id)
    if state is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Board not found"
        )
    return state
