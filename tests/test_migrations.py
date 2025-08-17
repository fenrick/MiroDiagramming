"""Smoke tests for database migrations."""

from pathlib import Path

import pytest
from alembic import command
from alembic.config import Config
import importlib
import miro_backend.core.config as app_config


def test_alembic_upgrade_creates_tables(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    """``alembic upgrade head`` succeeds against a temporary SQLite database."""
    db_path = tmp_path / "test.db"
    db_url = f"sqlite:///{db_path}"
    monkeypatch.setenv("MIRO_DATABASE_URL", db_url)
    importlib.reload(app_config)
    config = Config("alembic.ini")
    config.set_main_option("sqlalchemy.url", db_url)
    command.upgrade(config, "head")
    assert db_path.exists()
