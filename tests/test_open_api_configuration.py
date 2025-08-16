"""Tests for FastAPI OpenAPI configuration."""

from __future__ import annotations

import importlib

from fastapi.testclient import TestClient

from miro_backend.queue import ChangeQueue


def test_openapi_document_includes_health_path() -> None:
    """The generated OpenAPI document should expose the health endpoint."""

    app_module = importlib.import_module("miro_backend.main")
    app_module.change_queue = ChangeQueue()  # type: ignore[attr-defined]
    with TestClient(app_module.app) as client:
        response = client.get("/openapi.json")
        assert response.status_code == 200
        data = response.json()
        assert "/health" in data["paths"]
