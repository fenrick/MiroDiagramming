"""Tests for the cards API router."""

from __future__ import annotations

import importlib
from pathlib import Path

from fastapi.testclient import TestClient

from miro_backend.queue import ChangeTask, CreateNode


class StubQueue:
    """Queue stub that records enqueued tasks."""

    def __init__(self) -> None:
        self.tasks: list[ChangeTask] = []

    async def enqueue(self, task: ChangeTask) -> None:
        self.tasks.append(task)

    async def worker(self, client: object) -> None:  # pragma: no cover - stub
        """No-op worker used during testing."""

        return


def test_post_cards_enqueues_tasks(tmp_path: Path) -> None:
    """POSTing cards should enqueue matching change tasks."""

    static_dir = Path(__file__).resolve().parent.parent / "web" / "client" / "dist"
    static_dir.mkdir(parents=True, exist_ok=True)

    app_module = importlib.import_module("miro_backend.main")
    queue = StubQueue()
    app_module.change_queue = queue  # type: ignore[attr-defined]

    with TestClient(app_module.app) as client:
        response = client.post(
            "/api/cards",
            json=[{"id": "c1", "title": "t"}],
        )
        assert response.status_code == 202

    assert len(queue.tasks) == 1
    task = queue.tasks[0]
    assert isinstance(task, CreateNode)
    assert task.node_id == "c1"
    assert task.data["title"] == "t"
