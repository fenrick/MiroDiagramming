"""Task definitions for board changes.

Each task represents a single mutation to be applied to the remote Miro board.
Tasks derive from :class:`ChangeTask` which provides Pydantic based validation
and an asynchronous ``apply`` method that executes the change using a supplied
client instance.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any

from pydantic import BaseModel


class ChangeTask(BaseModel, ABC):
    """Abstract base class for all change tasks."""

    user_id: str
    job_id: str = ""
    index: int = 0

    @abstractmethod
    async def apply(
        self, client: Any, token: str
    ) -> None:  # pragma: no cover - interface
        """Apply the change using ``client`` and ``token``."""


class CreateNode(ChangeTask):
    """Create a new node on the board."""

    node_id: str
    data: dict[str, Any]

    async def apply(self, client: Any, token: str) -> None:
        await client.create_node(self.node_id, self.data, token)


class UpdateCard(ChangeTask):
    """Update an existing card with new attributes."""

    card_id: str
    payload: dict[str, Any]

    async def apply(self, client: Any, token: str) -> None:
        await client.update_card(self.card_id, self.payload, token)


class CreateShape(ChangeTask):
    """Create a new shape on a board."""

    board_id: str
    shape_id: str
    data: dict[str, Any]

    async def apply(self, client: Any, token: str) -> None:
        await client.create_shape(self.board_id, self.shape_id, self.data, token)


class UpdateShape(ChangeTask):
    """Update an existing shape."""

    board_id: str
    shape_id: str
    data: dict[str, Any]

    async def apply(self, client: Any, token: str) -> None:
        await client.update_shape(self.board_id, self.shape_id, self.data, token)


class DeleteShape(ChangeTask):
    """Delete a shape from a board."""

    board_id: str
    shape_id: str

    async def apply(self, client: Any, token: str) -> None:
        await client.delete_shape(self.board_id, self.shape_id, token)
