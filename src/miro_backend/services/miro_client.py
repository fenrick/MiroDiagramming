"""Minimal client abstraction for communicating with the Miro API."""

from __future__ import annotations

from collections.abc import Callable
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from typing import Any, cast

import httpx

from ..core.config import settings
from .errors import HttpError, RateLimitedError


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

    def _raise_for_status(self, response: httpx.Response) -> None:
        """Raise typed errors for problematic HTTP responses."""

        if response.status_code == 429:
            retry_after_header = response.headers.get("Retry-After")
            retry_after: float | None = None
            if retry_after_header is not None:
                try:
                    retry_after = float(retry_after_header)
                except ValueError:
                    try:
                        retry_at = parsedate_to_datetime(retry_after_header)
                    except (TypeError, ValueError):
                        pass
                    else:
                        delta = (
                            retry_at.astimezone(timezone.utc)
                            - datetime.now(timezone.utc)
                        ).total_seconds()
                        retry_after = max(0.0, delta)
            raise RateLimitedError(retry_after=retry_after)
        if 500 <= response.status_code < 600:
            raise HttpError(response.status_code)
        if response.status_code >= 400:
            response.raise_for_status()

    async def _request(self, method: str, url: str, **kwargs: Any) -> httpx.Response:
        """Make an HTTP request and translate connection errors."""

        timeout = kwargs.pop("timeout", settings.http_timeout_seconds)
        try:
            async with httpx.AsyncClient(
                base_url=self._base_url, timeout=timeout
            ) as client:
                response = await client.request(method, url, **kwargs)
        except httpx.RequestError as exc:  # pragma: no cover - network failure
            raise HttpError(status=503, message=str(exc)) from exc
        self._raise_for_status(response)
        return response

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

        await self._request(
            "PUT",
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

        await self._request(
            "PATCH",
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

        await self._request(
            "PUT",
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

        await self._request(
            "PATCH",
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

        await self._request(
            "DELETE",
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
        response = await self._request(
            "POST",
            token_url,
            data={
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": redirect_uri,
                "client_id": client_id,
                "client_secret": client_secret,
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=timeout,
        )
        return cast(dict[str, Any], response.json())

    async def refresh_token(
        self, refresh_token: str
    ) -> dict[str, Any]:  # pragma: no cover - external call
        """Refresh an access token using ``refresh_token``."""

        response = await self._request(
            "POST",
            settings.oauth_token_url,
            data={
                "grant_type": "refresh_token",
                "refresh_token": refresh_token,
                "client_id": settings.client_id,
                "client_secret": settings.client_secret.get_secret_value(),
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        return cast(dict[str, Any], response.json())


_client = MiroClient()


def get_miro_client() -> MiroClient:
    """Provide the global Miro client instance."""

    return _client
