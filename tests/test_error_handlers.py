"""Tests for custom error handlers."""

from __future__ import annotations

import importlib

from fastapi.testclient import TestClient

from miro_backend.db.session import Base, engine
from miro_backend.queue import ChangeQueue
from miro_backend.services.shape_store import get_shape_store


def setup_module() -> None:
    """Create database tables for tests."""

    Base.metadata.create_all(bind=engine)


def teardown_module() -> None:
    """Drop database tables after tests."""

    Base.metadata.drop_all(bind=engine)


def test_not_found_error_returns_typed_response() -> None:
    """Missing resources should return structured 404 responses."""

    app_module = importlib.import_module("miro_backend.main")
    app_module.change_queue = ChangeQueue()  # type: ignore[attr-defined]
    with TestClient(app_module.app) as client:
        response = client.get("/api/boards/999/tags")
        assert response.status_code == 404
        assert response.json() == {"code": "not_found", "message": "Board not found"}
        assert "X-Request-ID" in response.headers


def test_forbidden_error_returns_typed_response() -> None:
    """Unauthorized access should return structured 403 responses."""

    store = get_shape_store()
    store.add_board("board1", "owner1")
    app_module = importlib.import_module("miro_backend.main")
    app_module.change_queue = ChangeQueue()  # type: ignore[attr-defined]
    with TestClient(app_module.app) as client:
        response = client.get(
            "/api/boards/board1/shapes/shape1",
            headers={"X-User-Id": "other"},
        )
        assert response.status_code == 403
        assert response.json() == {"code": "forbidden", "message": "Not board owner"}
        assert "X-Request-ID" in response.headers
