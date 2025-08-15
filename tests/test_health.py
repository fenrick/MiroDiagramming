"""Smoke tests for the FastAPI application."""

from __future__ import annotations

import importlib
from pathlib import Path

from fastapi.testclient import TestClient

from miro_backend.queue import ChangeQueue


def test_health(tmp_path: Path) -> None:
    """The health endpoint should report a simple OK payload."""

    # ``miro_backend.main`` requires a built frontend directory to exist.
    static_dir = Path(__file__).resolve().parent.parent / "web" / "client" / "dist"
    static_dir.mkdir(parents=True, exist_ok=True)

    app_module = importlib.import_module("miro_backend.main")
    app_module.change_queue = ChangeQueue()  # type: ignore[attr-defined]
    with TestClient(app_module.app) as client:
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}


def test_root_redirect(tmp_path: Path) -> None:
    """The root should redirect browsers to the built front-end."""

    static_dir = Path(__file__).resolve().parent.parent / "web" / "client" / "dist"
    static_dir.mkdir(parents=True, exist_ok=True)

    app_module = importlib.import_module("miro_backend.main")
    app_module.change_queue = ChangeQueue()  # type: ignore[attr-defined]
    with TestClient(app_module.app) as client:
        response = client.get("/")
        assert response.status_code == 200
        assert "window.location.href" in response.text
