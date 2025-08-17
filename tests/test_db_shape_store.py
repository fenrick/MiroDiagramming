from __future__ import annotations

from miro_backend.db.session import Base, SessionLocal, engine
from miro_backend.schemas.shape import Shape
from miro_backend.services.shape_store import DbShapeStore


def setup_module() -> None:
    Base.metadata.create_all(bind=engine)


def teardown_module() -> None:
    Base.metadata.drop_all(bind=engine)


def test_db_shape_store_crud() -> None:
    store = DbShapeStore(SessionLocal())
    store.add_board("b1", "u1")
    assert store.board_owner("b1") == "u1"

    store.create("b1", Shape(id="s1", content="c"))
    assert store.get("b1", "s1") == Shape(id="s1", content="c")
    assert store.list("b1") == [Shape(id="s1", content="c")]

    store.update("b1", Shape(id="s1", content="n"))
    assert store.get("b1", "s1") == Shape(id="s1", content="n")

    store.delete("b1", "s1")
    assert store.get("b1", "s1") is None
