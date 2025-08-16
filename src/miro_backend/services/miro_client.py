"""Minimal client abstraction for communicating with the Miro API."""

from __future__ import annotations

from collections.abc import Callable
from typing import Any

import httpx

from ..core.config import settings


TokenProvider = Callable[[], str | None]


class MiroClient:
    """HTTP client for a subset of the Miro REST API."""

    def __init__(
        self,
        token: str | None = None,
        token_provider: TokenProvider | None = None,
    ) -> None:
        self._token = token
        self._token_provider = token_provider
        self._base_url = "https://api.miro.com/v2"

    def _auth_headers(self) -> dict[str, str]:
        token = self._token or (
            self._token_provider() if self._token_provider else None
        )
        return {"Authorization": f"Bearer {token}"} if token else {}

    async def create_node(self, node_id: str, data: dict[str, Any]) -> None:
        """Create a graph node.

        Parameters
        ----------
        node_id:
            Identifier for the node to create.
        data:
            Attributes for the node.
        """

        async with httpx.AsyncClient(
            base_url=self._base_url, timeout=settings.http_timeout_seconds
        ) as client:
            await client.put(
                f"/graph/nodes/{node_id}",
                json=data,
                headers=self._auth_headers(),
            )

    async def update_card(self, card_id: str, payload: dict[str, Any]) -> None:
        """Update an existing card.

        Parameters
        ----------
        card_id:
            Identifier of the card to update.
        payload:
            Changes to apply to the card.
        """

        async with httpx.AsyncClient(
            base_url=self._base_url, timeout=settings.http_timeout_seconds
        ) as client:
            await client.patch(
                f"/cards/{card_id}",
                json=payload,
                headers=self._auth_headers(),
            )

    async def create_shape(
        self, board_id: str, shape_id: str, data: dict[str, Any]
    ) -> None:
        """Create a shape on ``board_id`` with ``shape_id``.

        Parameters
        ----------
        board_id:
            Target board identifier.
        shape_id:
            Identifier for the new shape.
        data:
            Shape attributes to send to Miro.
        """

        async with httpx.AsyncClient(
            base_url=self._base_url, timeout=settings.http_timeout_seconds
        ) as client:
            await client.put(
                f"/boards/{board_id}/shapes/{shape_id}",
                json=data,
                headers=self._auth_headers(),
            )

    async def update_shape(
        self, board_id: str, shape_id: str, data: dict[str, Any]
    ) -> None:
        """Update ``shape_id`` on ``board_id``.

        Parameters
        ----------
        board_id:
            Target board identifier.
        shape_id:
            Identifier of the shape to update.
        data:
            Updated attributes for the shape.
        """

        async with httpx.AsyncClient(
            base_url=self._base_url, timeout=settings.http_timeout_seconds
        ) as client:
            await client.patch(
                f"/boards/{board_id}/shapes/{shape_id}",
                json=data,
                headers=self._auth_headers(),
            )

    async def delete_shape(self, board_id: str, shape_id: str) -> None:
        """Delete ``shape_id`` from ``board_id``.

        Parameters
        ----------
        board_id:
            Board containing the shape.
        shape_id:
            Identifier of the shape to delete.
        """

        async with httpx.AsyncClient(
            base_url=self._base_url, timeout=settings.http_timeout_seconds
        ) as client:
            await client.delete(
                f"/boards/{board_id}/shapes/{shape_id}",
                headers=self._auth_headers(),
            )

    async def exchange_code(
        self, code: str, redirect_uri: str
    ) -> dict[str, Any]:  # pragma: no cover - stub
        """Exchange an OAuth code for tokens."""
        raise NotImplementedError


_client = MiroClient()


def get_miro_client() -> MiroClient:
    """Provide the global Miro client instance."""

    return _client
