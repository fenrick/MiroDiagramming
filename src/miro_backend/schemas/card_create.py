"""Schema for card creation requests."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel

from ..queue import CreateNode, ChangeTask


class CardCreate(BaseModel):
    """Data describing a card to be created on the board."""

    id: str | None = None
    title: str
    description: str | None = None
    tags: list[str] | None = None
    style: dict[str, Any] | None = None
    fields: list[dict[str, Any]] | None = None
    taskStatus: str | None = None

    def to_task(self, user_id: str) -> ChangeTask:
        """Convert this definition into a :class:`ChangeTask` for ``user_id``."""

        payload = self.model_dump(exclude_none=True)
        node_id = payload.pop("id", "")
        return CreateNode(node_id=node_id, data=payload, user_id=user_id)
