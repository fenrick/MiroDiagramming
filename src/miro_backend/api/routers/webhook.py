"""Webhook endpoint for ingesting events from Miro."""

from __future__ import annotations

import asyncio
import hashlib
import hmac

from fastapi import APIRouter, Depends, Header, Request, Response, status

import logfire

from ...core.exceptions import BadRequestError, UnauthorizedError

from ...core.config import settings
from ...schemas.webhook import WebhookPayload

router = APIRouter(prefix="/api/webhook", tags=["webhook"])

_event_queue: asyncio.Queue[WebhookPayload] = asyncio.Queue()


def get_event_queue() -> asyncio.Queue[WebhookPayload]:
    """Return the queue used to store incoming webhook events."""

    return _event_queue


def _verify_signature(secret: str, body: bytes, signature: str) -> bool:
    """Return True when ``signature`` matches ``body`` using ``secret``."""

    expected = hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)


@router.post("", status_code=status.HTTP_202_ACCEPTED, response_class=Response)  # type: ignore[misc]
async def post_webhook(
    request: Request,
    signature: str | None = Header(default=None, alias="X-Miro-Signature"),
    queue: asyncio.Queue[WebhookPayload] = Depends(get_event_queue),
) -> Response:
    """Validate ``signature`` and enqueue the webhook payload."""

    with logfire.span("webhook received"):
        body = await request.body()
        with logfire.span("verify signature"):
            if signature is None or not _verify_signature(
                settings.webhook_secret, body, signature
            ):
                logfire.warning(
                    "invalid webhook signature"
                )  # warn when signature invalid
                raise UnauthorizedError("Invalid signature")

        try:
            with logfire.span("parse webhook payload"):
                payload = WebhookPayload.model_validate_json(body.decode())
        except Exception as exc:  # noqa: BLE001 - broad to return generic error
            logfire.warning(
                "invalid webhook payload"
            )  # warn when payload cannot be parsed
            raise BadRequestError("Invalid payload") from exc

        await queue.put(payload)
        logfire.info(
            "webhook queued", events=len(payload.events)
        )  # event after enqueue
        return Response(status_code=status.HTTP_202_ACCEPTED)
