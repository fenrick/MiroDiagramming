"""Integration test for cache refresh after change queue writes."""

from __future__ import annotations

import asyncio
import contextlib

import pytest

from miro_backend.db.session import Base, SessionLocal, engine
from miro_backend.models import CacheEntry
from miro_backend.queue import ChangeQueue, CreateShape
from miro_backend.services.repository import Repository


class FakeClient:
    async def create_shape(
        self, board_id: str, shape_id: str, data: dict[str, int], token: str
    ) -> None:  # pragma: no cover - behavior stubbed
        return None


@pytest.mark.integration  # type: ignore[misc]
@pytest.mark.asyncio  # type: ignore[misc]
async def test_cache_refresh(monkeypatch: pytest.MonkeyPatch) -> None:
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    queue = ChangeQueue()
    client = FakeClient()

    async def _token(*_: object) -> str:
        return "t"

    monkeypatch.setattr(
        "miro_backend.queue.change_queue.get_valid_access_token", _token
    )

    async def _fetch(_client: object, board_id: str, token: str) -> dict[str, str]:
        return {"id": board_id, "status": "fresh"}

    monkeypatch.setattr("miro_backend.queue.change_queue._fetch_board_snapshot", _fetch)

    worker = asyncio.create_task(queue.worker(session, client))

    await queue.enqueue(
        CreateShape(board_id="b1", shape_id="s1", data={}, user_id="u1")
    )
    await asyncio.sleep(0.2)
    worker.cancel()
    with contextlib.suppress(asyncio.CancelledError):
        await worker

    repo = Repository(session, CacheEntry)
    assert repo.get_board_state("b1") == {"id": "b1", "status": "fresh"}

    # Exercise update path and listing for coverage
    repo.set_board_state("b1", {"id": "b1", "status": "updated"})
    assert repo.get_board_state("b1") == {"id": "b1", "status": "updated"}
    assert repo.list()  # pragma: no branch - ensures list coverage

    session.close()
    Base.metadata.drop_all(bind=engine)
