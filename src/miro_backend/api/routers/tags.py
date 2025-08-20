"""HTTP routes for tag operations."""

from __future__ import annotations

from fastapi import APIRouter, Depends
import logfire

from ...core.exceptions import NotFoundError
from sqlalchemy.orm import Session

from ...db.session import get_session
from ...schemas.tag import Tag as TagSchema
from ...services.tag_repository import TagRepository

router = APIRouter(prefix="/api/boards", tags=["tags"])


@router.get("/{board_id}/tags", response_model=list[TagSchema])
def list_tags(
    board_id: int, session: Session = Depends(get_session)
) -> list[TagSchema]:
    """Return all tags for ``board_id`` sorted by name."""

    with logfire.span("list tags", board_id=board_id):
        repo = TagRepository(session)
        try:
            tags = repo.list_for_board(board_id)
        except LookupError as exc:  # pragma: no cover - exercised via tests
            logfire.warning(
                "board missing", board_id=board_id
            )  # warn when board absent
            raise NotFoundError("Board not found") from exc
        logfire.info(
            "tags listed", board_id=board_id, count=len(tags)
        )  # event after retrieval
        return [TagSchema.model_validate(tag) for tag in tags]
