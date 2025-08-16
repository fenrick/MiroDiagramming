"""Tests for application configuration loading."""

from pathlib import Path

import pytest

from miro_backend.core.config import Settings


def test_defaults_used_when_no_overrides() -> None:
    """Defaults are applied when no env or file provided."""

    settings = Settings()
    assert settings.database_url == "sqlite:///./app.db"
    assert settings.cors_origins == ["*"]


def test_yaml_overrides_defaults(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Values from a YAML config file override defaults."""

    config = tmp_path / "config.yaml"
    config.write_text(
        "database_url: sqlite:///yaml.db\ncors_origins:\n  - http://example.com\n",
        encoding="utf-8",
    )
    monkeypatch.setenv("MIRO_CONFIG_FILE", str(config))

    settings = Settings()
    assert settings.database_url == "sqlite:///yaml.db"
    assert settings.cors_origins == ["http://example.com"]


def test_env_overrides_yaml(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    """Environment variables take precedence over YAML config."""

    config = tmp_path / "config.yaml"
    config.write_text("database_url: sqlite:///yaml.db\n", encoding="utf-8")
    monkeypatch.setenv("MIRO_CONFIG_FILE", str(config))
    monkeypatch.setenv("MIRO_DATABASE_URL", "sqlite:///env.db")

    settings = Settings()
    assert settings.database_url == "sqlite:///env.db"
