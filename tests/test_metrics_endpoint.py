"""Integration tests for Prometheus metrics."""

from __future__ import annotations

import importlib
from pathlib import Path

from fastapi.testclient import TestClient

from miro_backend.queue import ChangeQueue


def test_metrics_increment(tmp_path: Path) -> None:
    """Metrics endpoint should expose request counters."""

    static_dir = Path(__file__).resolve().parent.parent / "web" / "client" / "dist"
    static_dir.mkdir(parents=True, exist_ok=True)

    app_module = importlib.import_module("miro_backend.main")
    app_module.change_queue = ChangeQueue()  # type: ignore[attr-defined]
    with TestClient(app_module.app) as client:

        def count() -> float:
            metrics = client.get("/metrics").text
            for line in metrics.splitlines():
                if (
                    line.startswith(
                        'http_requests_total{handler="/health",method="GET"'
                    )
                    and 'status="2xx"' in line
                ):
                    return float(line.split()[-1])
            return 0.0

        start = count()
        client.get("/health")
        after_first = count()
        assert after_first == start + 1

        client.get("/health")
        after_second = count()
        assert after_second == start + 2
