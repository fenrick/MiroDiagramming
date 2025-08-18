"""Pydantic models describing webhook requests from Miro."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict


class WebhookEvent(BaseModel):
    """Single event delivered by a webhook."""

    model_config = ConfigDict(extra="forbid")

    event: str
    data: dict[str, Any]


class WebhookPayload(BaseModel):
    """Overall payload sent by Miro containing one or more events."""

    model_config = ConfigDict(extra="forbid")

    events: list[WebhookEvent]
