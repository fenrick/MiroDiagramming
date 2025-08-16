from __future__ import annotations

import asyncio
import importlib
from pathlib import Path
from typing import Any

from fastapi.testclient import TestClient

from miro_backend.queue import ChangeQueue
from miro_backend.queue.tasks import CreateNode


async def _idle_worker(_: Any) -> None:
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

        asyncio.run(queue.enqueue(CreateNode(node_id="n1", data={})))
        assert gauge() == 1.0

        asyncio.run(queue.dequeue())
        assert gauge() == 0.0
