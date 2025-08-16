"""Minimal client abstraction for communicating with the Miro API."""

from __future__ import annotations

from collections.abc import Callable
from typing import Any, cast

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

    def _auth_headers(self, access_token: str | None = None) -> dict[str, str]:
        token = (
            access_token
            or self._token
            or (self._token_provider() if self._token_provider else None)
        )
        return {"Authorization": f"Bearer {token}"} if token else {}

    async def create_node(
        self, node_id: str, data: dict[str, Any], access_token: str
    ) -> None:
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
                headers=self._auth_headers(access_token),
            )

    async def update_card(
        self, card_id: str, payload: dict[str, Any], access_token: str
    ) -> None:
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
                headers=self._auth_headers(access_token),
            )

    async def create_shape(
        self,
        board_id: str,
        shape_id: str,
        data: dict[str, Any],
        access_token: str,
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
                headers=self._auth_headers(access_token),
            )

    async def update_shape(
        self,
        board_id: str,
        shape_id: str,
        data: dict[str, Any],
        access_token: str,
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
                headers=self._auth_headers(access_token),
            )

    async def delete_shape(
        self, board_id: str, shape_id: str, access_token: str
    ) -> None:
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
                headers=self._auth_headers(access_token),
            )

    async def exchange_code(
        self,
        code: str,
        redirect_uri: str,
        token_url: str,
        client_id: str,
        client_secret: str,
        timeout_seconds: float | None = None,
    ) -> dict[str, Any]:
        """Exchange an OAuth ``code`` for access and refresh tokens.

        Parameters
        ----------
        code:
            The authorization code issued by Miro after user consent.
        redirect_uri:
            The redirect URI used in the authorization request.
        token_url:
            Endpoint for exchanging the code for tokens.
        client_id:
            OAuth client identifier.
        client_secret:
            OAuth client secret.
        timeout_seconds:
            Optional request timeout override in seconds.

        Returns
        -------
        dict[str, Any]
            Parsed JSON response containing token information.

        Raises
        ------
        httpx.HTTPError
            If the HTTP request fails or returns a non-success status.
        """

        timeout = timeout_seconds or settings.http_timeout_seconds
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(
                token_url,
                data={
                    "grant_type": "authorization_code",
                    "code": code,
                    "redirect_uri": redirect_uri,
                    "client_id": client_id,
                    "client_secret": client_secret,
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            response.raise_for_status()
            return cast(dict[str, Any], response.json())

    async def refresh_token(
        self, refresh_token: str
    ) -> dict[str, Any]:  # pragma: no cover - external call
        """Refresh an access token using ``refresh_token``."""

        async with httpx.AsyncClient(timeout=settings.http_timeout_seconds) as client:
            response = await client.post(
                settings.oauth_token_url,
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
