"""Repository for tag entities."""

from __future__ import annotations

from collections.abc import Sequence

import logfire
from sqlalchemy.orm import Session

from ..models import Board, Tag
from .repository import Repository


class TagRepository(Repository[Tag]):
    """Data access layer for :class:`Tag` objects."""

    def __init__(self, session: Session) -> None:
        super().__init__(session, Tag)

    @logfire.instrument("list tags for board")  # type: ignore[misc]
    def list_for_board(self, board_id: int) -> Sequence[Tag]:
        """Return tags for ``board_id`` sorted by name.

        Raises:
            LookupError: If the board does not exist.
        """
        if self.session.get(Board, board_id) is None:
            logfire.info("board missing", board_id=board_id)  # event: board not found
            raise LookupError("Board not found")
        result = (
            self.session.query(Tag)
            .filter(Tag.board_id == board_id)
            .order_by(Tag.name.asc())
            .all()
        )
        logfire.info(
            "tags retrieved", board_id=board_id, count=len(result)
        )  # event: query complete
        return result
