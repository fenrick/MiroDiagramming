"""Tests for application configuration loading."""

from pathlib import Path

import pytest

from miro_backend.core.config import Settings


def test_defaults_used_when_no_overrides() -> None:
    """Defaults are applied when no env or file provided."""

    settings = Settings()
    assert settings.database_url == "sqlite:///./app.db"
    assert settings.cors_origins == ["*"]
    assert settings.logfire_service_name == "miro-backend"
    assert settings.logfire_send_to_logfire is False


def test_yaml_overrides_defaults(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Values from a YAML config file override defaults."""

    config = tmp_path / "config.yaml"
    config.write_text(
        (
            "database_url: sqlite:///yaml.db\n"
            "cors_origins:\n  - http://example.com\n"
            "logfire_service_name: yaml-service\n"
            "logfire_send_to_logfire: true\n"
        ),
        encoding="utf-8",
    )
    monkeypatch.setenv("MIRO_CONFIG_FILE", str(config))

    settings = Settings()
    assert settings.database_url == "sqlite:///yaml.db"
    assert settings.cors_origins == ["http://example.com"]
    assert settings.logfire_service_name == "yaml-service"
    assert settings.logfire_send_to_logfire is True


def test_env_overrides_yaml(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    """Environment variables take precedence over YAML config."""

    config = tmp_path / "config.yaml"
    config.write_text(
        ("database_url: sqlite:///yaml.db\n" "logfire_send_to_logfire: false\n"),
        encoding="utf-8",
    )
    monkeypatch.setenv("MIRO_CONFIG_FILE", str(config))
    monkeypatch.setenv("MIRO_DATABASE_URL", "sqlite:///env.db")
    monkeypatch.setenv("MIRO_LOGFIRE_SEND_TO_LOGFIRE", "true")

    settings = Settings()
    assert settings.database_url == "sqlite:///env.db"
    assert settings.logfire_send_to_logfire is True
