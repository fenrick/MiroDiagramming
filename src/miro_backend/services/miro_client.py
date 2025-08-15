"""Minimal client abstraction for communicating with the Miro API."""

from __future__ import annotations

from typing import Any


class MiroClient:
    """Placeholder Miro client.

    The real implementation would perform HTTP requests to Miro's REST API. In
    tests we provide a fake implementation that records calls.
    """

    async def create_node(
        self, node_id: str, data: dict[str, Any]
    ) -> None:  # pragma: no cover - stub
        """Create a node on the board."""

    async def update_card(
        self, card_id: str, payload: dict[str, Any]
    ) -> None:  # pragma: no cover - stub
        """Update a card on the board."""

    async def create_shape(
        self, board_id: str, shape_id: str, data: dict[str, Any]
    ) -> None:  # pragma: no cover - stub
        """Create a shape on ``board_id``."""

    async def update_shape(
        self, board_id: str, shape_id: str, data: dict[str, Any]
    ) -> None:  # pragma: no cover - stub
        """Update ``shape_id`` on ``board_id``."""

    async def delete_shape(
        self, board_id: str, shape_id: str
    ) -> None:  # pragma: no cover - stub
        """Delete ``shape_id`` from ``board_id``."""
