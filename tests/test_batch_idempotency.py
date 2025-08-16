from __future__ import annotations

import asyncio
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from miro_backend.main import app
from miro_backend.queue.change_queue import ChangeQueue
from miro_backend.queue.persistence import SqlAlchemyQueuePersistence
from miro_backend.queue.provider import get_change_queue
from miro_backend.db.session import Base


@pytest.fixture  # type: ignore[misc]
def client(tmp_path: Path) -> TestClient:
    engine = create_engine(
        f"sqlite:///{tmp_path/'queue.db'}", connect_args={"check_same_thread": False}
    )
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    persistence = SqlAlchemyQueuePersistence(Session)
    queue = ChangeQueue(persistence=persistence)
    app.dependency_overrides[get_change_queue] = lambda: queue
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


def test_post_batch_is_idempotent_across_reloads(
    client: TestClient, tmp_path: Path
) -> None:
    body = {
        "operations": [
            {"type": "create_node", "node_id": "n1", "data": {"x": 1}},
            {"type": "update_card", "card_id": "c1", "payload": {"y": 2}},
        ]
    }
    headers = {"Idempotency-Key": "abc123", "X-User-Id": "u1"}

    first = client.post("/api/batch", json=body, headers=headers)
    assert first.status_code == 202

    # Drain persisted tasks to simulate worker processing
    queue: ChangeQueue = app.dependency_overrides[get_change_queue]()

    async def drain(q: ChangeQueue) -> None:
        while not q._queue.empty():
            await q.dequeue()

    asyncio.run(drain(queue))

    # Recreate queue to simulate process restart
    engine = create_engine(
        f"sqlite:///{tmp_path/'queue.db'}", connect_args={"check_same_thread": False}
    )
    Session = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    persistence = SqlAlchemyQueuePersistence(Session)
    new_queue = ChangeQueue(persistence=persistence)
    app.dependency_overrides[get_change_queue] = lambda: new_queue

    second = client.post("/api/batch", json=body, headers=headers)
    assert second.json() == first.json()
    assert new_queue._queue.empty()
