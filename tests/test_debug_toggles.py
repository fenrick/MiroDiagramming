import asyncio
import importlib
from datetime import datetime, timezone
from typing import Any

from fastapi.testclient import TestClient

from miro_backend.queue import ChangeQueue
from miro_backend.queue.provider import get_change_queue
from miro_backend.schemas.user_info import UserInfo
from miro_backend.services.user_store import (
    InMemoryUserStore,
    get_user_store,
)


def setup_app() -> Any:
    app_module = importlib.import_module("miro_backend.main")
    queue = ChangeQueue()

    async def _idle_worker(_: Any, __: Any) -> None:
        await asyncio.Event().wait()

    queue.worker = _idle_worker
    app_module.change_queue = queue  # type: ignore[attr-defined]
    app_module.app.dependency_overrides[get_change_queue] = lambda: queue
    return app_module


def test_debug_limits_header_forces_near_state() -> None:
    app_module = setup_app()
    with TestClient(app_module.app) as client:
        response = client.get("/api/limits", headers={"X-Debug-Limits": "1"})
    app_module.app.dependency_overrides.clear()
    assert response.status_code == 200
    assert response.json()["bucket_fill"] == {"user": 95}


def test_debug_auth_expired_forces_not_found() -> None:
    app_module = setup_app()
    store = InMemoryUserStore()
    store.store(
        UserInfo(
            id="1",
            name="n",
            access_token="a",
            refresh_token="r",
            expires_at=datetime.now(timezone.utc),
        )
    )
    app_module.app.dependency_overrides[get_user_store] = lambda: store
    with TestClient(app_module.app) as client:
        normal = client.get("/api/auth/status", headers={"X-User-Id": "1"})
        debug = client.get(
            "/api/auth/status",
            headers={"X-User-Id": "1", "X-Debug-Auth": "expired"},
        )
    app_module.app.dependency_overrides.clear()
    assert normal.status_code == 200
    assert debug.status_code == 404


def test_debug_429_middleware_returns_for_next_requests() -> None:
    app_module = setup_app()
    with TestClient(app_module.app) as client:
        client.get("/api/limits", headers={"X-Debug-429": "2"})
        first = client.get("/api/limits")
        second = client.get("/api/limits")
        third = client.get("/api/limits")
    app_module.app.dependency_overrides.clear()
    assert first.status_code == 429
    assert second.status_code == 429
    assert third.status_code == 200
