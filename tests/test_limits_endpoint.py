import asyncio
import importlib
from typing import Any

from fastapi.testclient import TestClient

from miro_backend.queue import ChangeQueue
from miro_backend.queue.provider import get_change_queue


async def _idle_worker(_: Any, __: Any) -> None:
    await asyncio.Event().wait()


def test_limits_endpoint_returns_shape() -> None:
    app_module = importlib.import_module("miro_backend.main")
    queue = ChangeQueue()
    queue.worker = _idle_worker

    def bucket_fill_stub() -> dict[str, int]:
        return {"user": 1}

    queue.bucket_fill = bucket_fill_stub
    app_module.change_queue = queue  # type: ignore[attr-defined]
    app_module.app.dependency_overrides[get_change_queue] = lambda: queue
    with TestClient(app_module.app) as client:
        response = client.get("/api/limits")
    app_module.app.dependency_overrides.clear()
    assert response.status_code == 200
    data = response.json()
    assert set(data.keys()) == {"queue_length", "bucket_fill"}
    assert data["bucket_fill"] == {"user": 1}
    assert isinstance(data["queue_length"], int)


def test_bucket_fill_default_state() -> None:
    queue = ChangeQueue()
    assert queue.bucket_fill() == {}
