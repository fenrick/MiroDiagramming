from __future__ import annotations

import asyncio
import importlib
from pathlib import Path
from typing import Any
import contextlib

import pytest
from fastapi.testclient import TestClient

from miro_backend.queue import ChangeQueue
from miro_backend.queue.tasks import CreateNode
from miro_backend.queue.change_queue import task_success, task_duration


async def _idle_worker(_: Any, __: Any) -> None:
    await asyncio.Event().wait()


def test_change_queue_length_metric(tmp_path: Path) -> None:
    """Gauge should reflect queue size on enqueue and dequeue."""

    static_dir = Path(__file__).resolve().parent.parent / "web" / "client" / "dist"
    static_dir.mkdir(parents=True, exist_ok=True)

    app_module = importlib.import_module("miro_backend.main")
    queue = ChangeQueue()
    queue.worker = _idle_worker
    app_module.change_queue = queue  # type: ignore[attr-defined]

    with TestClient(app_module.app) as client:

        def gauge() -> float:
            metrics = client.get("/metrics").text
            for line in metrics.splitlines():
                if line.startswith("change_queue_length"):
                    return float(line.split()[-1])
            return -1.0

        assert gauge() == 0.0

        asyncio.run(queue.enqueue(CreateNode(node_id="n1", data={}, user_id="u1")))
        assert gauge() == 1.0

        asyncio.run(queue.dequeue())
        assert gauge() == 0.0


@pytest.mark.asyncio()  # type: ignore[misc]
async def test_change_task_success_metrics(monkeypatch: pytest.MonkeyPatch) -> None:
    """Successful tasks should increment counters and record duration."""

    task_success.clear()
    task_duration.clear()

    queue = ChangeQueue()

    class DummyClient:
        def __init__(self) -> None:
            self.created: list[tuple[str, dict[str, int]]] = []

        async def create_node(
            self, node_id: str, data: dict[str, int], _token: str
        ) -> None:
            await asyncio.sleep(0.01)
            self.created.append((node_id, data))

    async def _token(*_: object) -> str:
        return "t"

    monkeypatch.setattr(
        "miro_backend.queue.change_queue.get_valid_access_token", _token
    )

    client = DummyClient()
    worker = asyncio.create_task(queue.worker(object(), client))
    try:
        await queue.enqueue(CreateNode(node_id="n1", data={}, user_id="u1"))
        while not client.created:
            await asyncio.sleep(0.01)
    finally:
        worker.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await worker

    label = "CreateNode"
    assert task_success.labels(type=label)._value.get() == 1.0
    metric = task_duration.labels(type=label)
    samples = {s.name: s.value for s in metric._child_samples()}
    assert samples["_count"] == 1.0
    assert samples["_sum"] > 0.0
