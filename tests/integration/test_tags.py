"""Integration tests for tag routes."""

from __future__ import annotations

import httpx
import pytest

from typing import TYPE_CHECKING

from miro_backend.db.session import Base, SessionLocal, engine
from miro_backend.models import Board, Tag

if TYPE_CHECKING:
    from .conftest import DummyQueue


@pytest.mark.integration  # type: ignore[misc]
@pytest.mark.asyncio  # type: ignore[misc]
async def test_list_tags_sorted(
    client_queue: tuple[httpx.AsyncClient, "DummyQueue"]
) -> None:
    """The endpoint should return tags sorted alphabetically."""

    client, _queue = client_queue
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    board = Board(board_id="b1", owner_id="user-1", name="test-board")
    session.add(board)
    session.commit()
    board_pk = int(board.id)
    session.add_all(
        [Tag(board_id=board_pk, name="beta"), Tag(board_id=board_pk, name="alpha")]
    )
    session.commit()
    session.close()

    response = await client.get(f"/api/boards/{board_pk}/tags")
    Base.metadata.drop_all(bind=engine)
    assert response.status_code == 200
    data = response.json()
    assert [item["name"] for item in data] == ["alpha", "beta"]
