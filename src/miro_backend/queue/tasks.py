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

    @abstractmethod
    async def apply(self, client: Any) -> None:  # pragma: no cover - interface
        """Apply the change using ``client``."""


class CreateNode(ChangeTask):
    """Create a new node on the board."""

    node_id: str
    data: dict[str, Any]

    async def apply(self, client: Any) -> None:
        await client.create_node(self.node_id, self.data)


class UpdateCard(ChangeTask):
    """Update an existing card with new attributes."""

    card_id: str
    payload: dict[str, Any]

    async def apply(self, client: Any) -> None:
        await client.update_card(self.card_id, self.payload)
