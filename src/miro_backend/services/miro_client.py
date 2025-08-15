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
