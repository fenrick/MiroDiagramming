"""Tests for the ``/api/logs`` endpoint."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Iterator

import pytest
from fastapi.testclient import TestClient

from miro_backend.db.session import Base, SessionLocal, engine
from miro_backend.main import app
from miro_backend.models import LogEntry


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


def test_capture_rejects_large_batch(client: TestClient) -> None:
    payload = [
        {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": "info",
            "message": "m",
        }
    ] * 101

    response = client.post("/api/logs", json=payload)
    assert response.status_code == 413
