"""Repository for tag entities."""

from __future__ import annotations

from collections.abc import Sequence

from sqlalchemy.orm import Session

from ..models import Board, Tag
from .repository import Repository


class TagRepository(Repository[Tag]):
    """Data access layer for :class:`Tag` objects."""

    def __init__(self, session: Session) -> None:
        super().__init__(session, Tag)

    def list_for_board(self, board_id: int) -> Sequence[Tag]:
        """Return tags for ``board_id`` sorted by name.

        Raises:
            LookupError: If the board does not exist.
        """
        if self.session.get(Board, board_id) is None:
            raise LookupError("Board not found")
        return (
            self.session.query(Tag)
            .filter(Tag.board_id == board_id)
            .order_by(Tag.name.asc())
            .all()
        )
