"""Ensure cache refreshes after successful change batches."""

from __future__ import annotations

import asyncio
import contextlib

import pytest

from miro_backend.db.session import Base, SessionLocal, engine
from miro_backend.models import CacheEntry
from miro_backend.queue import ChangeQueue
from miro_backend.queue.tasks import CreateShape
from miro_backend.services.repository import Repository


class DummyClient:
    """Client stub recording calls."""

    def __init__(self) -> None:
        self.created: list[tuple[str, str]] = []

    async def create_shape(
        self, board_id: str, shape_id: str, data: dict[str, int], _token: str
    ) -> None:
        self.created.append((board_id, shape_id))

    async def get_board(self, board_id: str, _token: str) -> dict[str, str]:
        return {"id": board_id}


@pytest.mark.integration  # type: ignore[misc]
@pytest.mark.asyncio()  # type: ignore[misc]
async def test_refreshes_cache(monkeypatch: pytest.MonkeyPatch) -> None:
    """Enqueuing a change should refresh the board cache."""

    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    queue = ChangeQueue(refresh_debounce_ms=0)

    async def _token(*_: object) -> str:
        return "t"

    monkeypatch.setattr(
        "miro_backend.queue.change_queue.get_valid_access_token", _token
    )

    client = DummyClient()
    worker = asyncio.create_task(queue.worker(session, client))
    try:
        await queue.enqueue(
            CreateShape(board_id="b1", shape_id="s1", data={}, user_id="u1")
        )
        repo: Repository[CacheEntry] = Repository(session, CacheEntry)
        for _ in range(50):
            await asyncio.sleep(0.02)
            if repo.get_board_state("b1") is not None:
                break
        state = repo.get_board_state("b1")
        assert state == {"id": "b1"}
    finally:
        worker.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await worker
        session.close()
        Base.metadata.drop_all(bind=engine)
