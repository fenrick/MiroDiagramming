"""Tests for the ``/api/logs`` endpoint."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Iterator

import pytest
from fastapi.testclient import TestClient

from miro_backend.core.config import settings
from miro_backend.db.session import Base, SessionLocal, engine
from miro_backend.main import app
from miro_backend.models import LogEntry
from miro_backend.api.routers.logs import (
    logs_ingested_total,
    log_batch_size_bytes,
)


def setup_module() -> None:
    Base.metadata.create_all(bind=engine)


def teardown_module() -> None:
    Base.metadata.drop_all(bind=engine)


# mypy struggles with pytest decorators
@pytest.fixture  # type: ignore[misc]
def client() -> Iterator[TestClient]:
    yield TestClient(app)


def test_capture_persists_sanitised_entries(client: TestClient) -> None:
    payload = [
        {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": "INFO",
            "message": "<script>alert(1)</script>",
            "context": {"k": "<v>"},
        }
    ]
    response = client.post("/api/logs", json=payload)
    assert response.status_code == 202

    session = SessionLocal()
    try:
        entries = session.query(LogEntry).all()
        assert len(entries) == 1
        assert entries[0].message == "&lt;script&gt;alert(1)&lt;/script&gt;"
        assert entries[0].context == {"k": "&lt;v&gt;"}
    finally:
        session.close()


def test_metrics_update_on_capture(client: TestClient) -> None:
    logs_ingested_total.clear()
    log_batch_size_bytes.clear()

    payload = [
        {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": "INFO",
            "message": "m",
        }
    ]

    response = client.post("/api/logs", json=payload)
    assert response.status_code == 202

    assert logs_ingested_total._value.get() == len(payload)
    samples = {s.name: s.value for s in log_batch_size_bytes._samples()}
    body = response.request.body
    if not isinstance(body, (bytes, bytearray)):
        body = body.encode()
    expected_size = len(body)
    assert samples["_count"] == 1.0
    assert samples["_sum"] == float(expected_size)


def test_capture_rejects_large_batch(client: TestClient) -> None:
    payload = [
        {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": "info",
            "message": "m",
        }
    ] * 1001

    response = client.post("/api/logs", json=payload)
    assert response.status_code == 413


def test_capture_rejects_large_payload(client: TestClient) -> None:
    payload = [
        {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": "info",
            "message": "m" * 1024,
        }
        for _ in range(1000)
    ]

    response = client.post("/api/logs", json=payload)
    assert response.status_code == 413


def test_capture_respects_custom_entry_limit(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setattr(settings, "log_max_entries", 1)
    payload = [
        {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": "info",
            "message": "m",
        }
    ] * 2

    response = client.post("/api/logs", json=payload)
    assert response.status_code == 413


def test_capture_respects_custom_payload_limit(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setattr(settings, "log_max_payload_bytes", 10)
    payload = [
        {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": "info",
            "message": "x" * 100,
        }
    ]

    response = client.post("/api/logs", json=payload)
    assert response.status_code == 413
