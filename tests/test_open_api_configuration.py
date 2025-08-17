"""Tests for FastAPI OpenAPI configuration."""

from __future__ import annotations

import importlib

from fastapi.testclient import TestClient

from miro_backend.queue import ChangeQueue


def test_openapi_document_includes_examples() -> None:
    """The generated OpenAPI document should include metadata and examples."""

    app_module = importlib.import_module("miro_backend.main")
    app_module.change_queue = ChangeQueue()  # type: ignore[attr-defined]
    with TestClient(app_module.app) as client:
        response = client.get("/openapi.json")
        assert response.status_code == 200
        data = response.json()
        assert "/health" in data["paths"]
        assert data["servers"][0]["url"] == "http://localhost:8000"
        tag_names = {t["name"] for t in data["tags"]}
        assert {"batch", "jobs"}.issubset(tag_names)

        batch_post = data["paths"]["/api/batch"]["post"]
        schema_ref = batch_post["requestBody"]["content"]["application/json"]["schema"][
            "$ref"
        ]
        schema_name = schema_ref.split("/")[-1]
        schema = data["components"]["schemas"][schema_name]
        assert "example" in schema

        idempotency_header = next(
            p for p in batch_post["parameters"] if p["name"] == "Idempotency-Key"
        )
        assert "example" in idempotency_header
