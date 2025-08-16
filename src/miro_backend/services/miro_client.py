"""Minimal client abstraction for communicating with the Miro API."""

from __future__ import annotations

from typing import Any, cast

import httpx

from miro_backend.core.config import settings


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

    async def exchange_code(self, code: str, redirect_uri: str) -> dict[str, Any]:
        """Exchange an OAuth code for access and refresh tokens.

        Parameters
        ----------
        code:
            The authorization code issued by Miro after user consent.
        redirect_uri:
            The redirect URI used in the authorization request.

        Returns
        -------
        dict[str, Any]
            Parsed JSON response containing token information.

        Raises
        ------
        httpx.HTTPError
            If the HTTP request fails or returns a non-success status.
        """

        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.miro.com/v1/oauth/token",
                data={
                    "grant_type": "authorization_code",
                    "code": code,
                    "redirect_uri": redirect_uri,
                    "client_id": settings.client_id,
                    "client_secret": settings.client_secret.get_secret_value(),
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            response.raise_for_status()
            return cast(dict[str, Any], response.json())

    async def refresh_token(self, refresh_token: str) -> dict[str, Any]:
        """Refresh OAuth access using a refresh token.

        Parameters
        ----------
        refresh_token:
            The refresh token previously issued by Miro.

        Returns
        -------
        dict[str, Any]
            Parsed JSON response containing new token data.

        Raises
        ------
        httpx.HTTPError
            If the HTTP request fails or returns a non-success status.
        """

        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.miro.com/v1/oauth/token",
                data={
                    "grant_type": "refresh_token",
                    "refresh_token": refresh_token,
                    "client_id": settings.client_id,
                    "client_secret": settings.client_secret.get_secret_value(),
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            response.raise_for_status()
            return cast(dict[str, Any], response.json())


_client = MiroClient()


def get_miro_client() -> MiroClient:
    """Provide the global Miro client instance."""

    return _client
