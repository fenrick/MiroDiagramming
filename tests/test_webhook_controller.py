"""Tests for the webhook router."""

from __future__ import annotations

import asyncio
import hashlib
import hmac
import json
from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient

from miro_backend.api.routers import webhook as webhook_router
from miro_backend.core.config import settings
from miro_backend.main import app
from miro_backend.schemas.webhook import WebhookEvent, WebhookPayload


def _sign(body: bytes) -> str:
    return hmac.new(settings.webhook_secret.encode(), body, hashlib.sha256).hexdigest()


# mypy struggles with pytest decorators
@pytest.fixture  # type: ignore[misc]
def client_queue() -> Iterator[tuple[TestClient, asyncio.Queue[WebhookPayload]]]:
    queue: asyncio.Queue[WebhookPayload] = asyncio.Queue()
    app.dependency_overrides[webhook_router.get_event_queue] = lambda: queue
    client = TestClient(app)
    yield client, queue
    app.dependency_overrides.clear()


def test_post_webhook_enqueues_event(
    client_queue: tuple[TestClient, asyncio.Queue[WebhookPayload]]
) -> None:
    client, queue = client_queue
    payload: dict[str, object] = {"events": [{"event": "created", "data": {"x": 1}}]}
    body = json.dumps(payload).encode()
    signature = _sign(body)

    response = client.post(
        "/api/webhook", data=body, headers={"X-Miro-Signature": signature}
    )

    assert response.status_code == 202
    assert queue.qsize() == 1
    assert queue.get_nowait() == WebhookPayload(
        events=[WebhookEvent(event="created", data={"x": 1})]
    )


def test_post_webhook_rejects_bad_signature(
    client_queue: tuple[TestClient, asyncio.Queue[WebhookPayload]]
) -> None:
    client, queue = client_queue
    payload: dict[str, object] = {"events": []}
    body = json.dumps(payload).encode()

    response = client.post(
        "/api/webhook", data=body, headers={"X-Miro-Signature": "bad"}
    )

    assert response.status_code == 401
    assert queue.qsize() == 0


def test_post_webhook_requires_signature(
    client_queue: tuple[TestClient, asyncio.Queue[WebhookPayload]]
) -> None:
    client, queue = client_queue
    payload: dict[str, object] = {"events": []}
    body = json.dumps(payload).encode()

    response = client.post("/api/webhook", data=body)

    assert response.status_code == 401
    assert queue.qsize() == 0


def test_post_webhook_validates_payload(
    client_queue: tuple[TestClient, asyncio.Queue[WebhookPayload]]
) -> None:
    client, queue = client_queue
    body = b"not-json"
    signature = _sign(body)

    response = client.post(
        "/api/webhook", data=body, headers={"X-Miro-Signature": signature}
    )

    assert response.status_code == 400
    assert queue.qsize() == 0
