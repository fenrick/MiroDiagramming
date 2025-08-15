"""Pydantic models describing webhook requests from Miro."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel


class WebhookEvent(BaseModel):
    """Single event delivered by a webhook."""

    event: str
    data: dict[str, Any]


class WebhookPayload(BaseModel):
    """Overall payload sent by Miro containing one or more events."""

    events: list[WebhookEvent]
