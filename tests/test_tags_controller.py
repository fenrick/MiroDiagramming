"""Tests for the tags API router."""

from __future__ import annotations

import importlib

from fastapi.testclient import TestClient

from miro_backend.db.session import Base, SessionLocal, engine
from miro_backend.models import Board, Tag
from miro_backend.queue import ChangeQueue


def setup_module() -> None:
    """Create database tables for tests."""

    Base.metadata.create_all(bind=engine)


def teardown_module() -> None:
    """Drop database tables after tests."""

    Base.metadata.drop_all(bind=engine)


def _create_board_with_tags() -> int:
    session = SessionLocal()
    board = Board(board_id="b1", owner_id="user-1", name="test-board")
    session.add(board)
    session.commit()
    board_pk = int(board.id)
    session.add_all(
        [
            Tag(board_id=board_pk, name="beta"),
            Tag(board_id=board_pk, name="alpha"),
        ]
    )
    session.commit()
    session.close()
    return board_pk


def test_list_tags_sorted_by_name() -> None:
    """The endpoint should return tags sorted alphabetically."""

    board_id = _create_board_with_tags()
    app_module = importlib.import_module("miro_backend.main")
    app_module.change_queue = ChangeQueue()  # type: ignore[attr-defined]
    with TestClient(app_module.app) as client:
        response = client.get(f"/api/boards/{board_id}/tags")
        assert response.status_code == 200
        data = response.json()
        assert [item["name"] for item in data] == ["alpha", "beta"]


def test_list_tags_missing_board() -> None:
    """A missing board should yield a 404 response."""

    app_module = importlib.import_module("miro_backend.main")
    app_module.change_queue = ChangeQueue()  # type: ignore[attr-defined]
    with TestClient(app_module.app) as client:
        response = client.get("/api/boards/999/tags")
        assert response.status_code == 404
