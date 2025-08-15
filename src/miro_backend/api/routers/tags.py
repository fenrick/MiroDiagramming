"""HTTP routes for tag operations."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...db.session import get_session
from ...schemas.tag import Tag as TagSchema
from ...services.tag_repository import TagRepository

router = APIRouter(prefix="/api/boards", tags=["tags"])


@router.get("/{board_id}/tags", response_model=list[TagSchema])  # type: ignore[misc]
def list_tags(
    board_id: int, session: Session = Depends(get_session)
) -> list[TagSchema]:
    """Return all tags for ``board_id`` sorted by name."""

    repo = TagRepository(session)
    try:
        tags = repo.list_for_board(board_id)
    except LookupError as exc:  # pragma: no cover - exercised via tests
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Board not found"
        ) from exc
    return [TagSchema.model_validate(tag) for tag in tags]
