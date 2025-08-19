from __future__ import annotations

import asyncio
import time
from pathlib import Path

import pytest
from cachetools import TTLCache
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from miro_backend.api.routers import batch
from miro_backend.main import app
from miro_backend.queue.change_queue import ChangeQueue
from miro_backend.queue.persistence import SqlAlchemyQueuePersistence
from miro_backend.queue.provider import get_change_queue
from miro_backend.db.session import Base, engine as db_engine


@pytest.fixture  # type: ignore[misc]
def client(tmp_path: Path) -> TestClient:
    engine = create_engine(
        f"sqlite:///{tmp_path/'queue.db'}", connect_args={"check_same_thread": False}
    )
    Base.metadata.create_all(bind=engine)
    Base.metadata.create_all(bind=db_engine)
    Session = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    persistence = SqlAlchemyQueuePersistence(Session)
    queue = ChangeQueue(persistence=persistence)
    app.dependency_overrides[get_change_queue] = lambda: queue
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=db_engine)


async def drain(queue: ChangeQueue) -> None:
    """Mark all tasks in ``queue`` as succeeded."""

    while not queue._queue.empty():
        task = await queue.dequeue()
        await queue.mark_task_succeeded(task)


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


def test_cache_entry_expires_and_uses_persistence(client: TestClient) -> None:
    body = {
        "operations": [
            {"type": "create_node", "node_id": "n1", "data": {"x": 1}},
            {"type": "update_card", "card_id": "c1", "payload": {"y": 2}},
        ]
    }
    headers = {"Idempotency-Key": "ttl", "X-User-Id": "u1"}
    original = batch._IDEMPOTENCY_CACHE
    batch._IDEMPOTENCY_CACHE = TTLCache(maxsize=10, ttl=0.1)
    try:
        first = client.post("/api/batch", json=body, headers=headers)
        assert first.status_code == 202
        queue: ChangeQueue = app.dependency_overrides[get_change_queue]()
        asyncio.run(drain(queue))
        time.sleep(0.2)
        assert "ttl" not in batch._IDEMPOTENCY_CACHE
        second = client.post("/api/batch", json=body, headers=headers)
        assert second.json() == first.json()
        assert queue._queue.empty()
    finally:
        batch._IDEMPOTENCY_CACHE = original


def test_lru_eviction_uses_persistence(client: TestClient) -> None:
    body = {
        "operations": [
            {"type": "create_node", "node_id": "n1", "data": {"x": 1}},
        ]
    }
    headers1 = {"Idempotency-Key": "k1", "X-User-Id": "u1"}
    headers2 = {"Idempotency-Key": "k2", "X-User-Id": "u1"}
    original = batch._IDEMPOTENCY_CACHE
    batch._IDEMPOTENCY_CACHE = TTLCache(maxsize=1, ttl=60.0)
    try:
        first = client.post("/api/batch", json=body, headers=headers1)
        assert first.status_code == 202
        queue: ChangeQueue = app.dependency_overrides[get_change_queue]()
        asyncio.run(drain(queue))

        second = client.post("/api/batch", json=body, headers=headers2)
        assert second.status_code == 202
        asyncio.run(drain(queue))
        assert "k1" not in batch._IDEMPOTENCY_CACHE

        third = client.post("/api/batch", json=body, headers=headers1)
        assert third.json() == first.json()
        assert queue._queue.empty()
    finally:
        batch._IDEMPOTENCY_CACHE = original
