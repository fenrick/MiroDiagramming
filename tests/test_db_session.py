"""Tests for the database session generator."""

from __future__ import annotations

import pytest
from sqlalchemy import text

from miro_backend.db.session import get_session


def test_get_session_yields_and_closes() -> None:
    """``get_session`` should yield a session and close it afterwards."""

    gen = get_session()
    session = next(gen)
    # session is usable
    session.execute(text("select 1"))
    with pytest.raises(StopIteration):
        next(gen)
