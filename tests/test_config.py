"""Tests for application configuration loading."""

from pathlib import Path
import importlib
import shutil

import pytest
from pydantic import ValidationError

import miro_backend.core.config as config
from miro_backend.core.config import Settings


def test_defaults_used_when_no_overrides(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Defaults are applied when no env or file provided."""

    monkeypatch.setenv("MIRO_CONFIG_FILE", str(tmp_path / "missing.yaml"))
    monkeypatch.setenv("MIRO_CLIENT_ID", "id")
    monkeypatch.setenv("MIRO_CLIENT_SECRET", "secret")
    monkeypatch.setenv("MIRO_WEBHOOK_SECRET", "hook")
    monkeypatch.setenv("MIRO_REDIRECT_URI", "http://redirect")

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


def test_missing_secrets_raise_error(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Omitting required secrets raises a validation error."""

    monkeypatch.chdir(tmp_path)
    monkeypatch.delenv("MIRO_CLIENT_ID", raising=False)
    monkeypatch.delenv("MIRO_CLIENT_SECRET", raising=False)
    monkeypatch.delenv("MIRO_WEBHOOK_SECRET", raising=False)
    monkeypatch.setenv("MIRO_CONFIG_FILE", str(tmp_path / "missing.yaml"))

    with pytest.raises(ValidationError):
        Settings()


def test_missing_redirect_uri_raises_error(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Unsetting redirect URI triggers a validation error."""

    monkeypatch.chdir(tmp_path)
    monkeypatch.delenv("MIRO_REDIRECT_URI", raising=False)
    monkeypatch.setenv("MIRO_CONFIG_FILE", str(tmp_path / "missing.yaml"))

    with pytest.raises(ValidationError):
        Settings()


def test_creates_default_files_when_missing(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Default files are generated when none are present."""

    for var in ("MIRO_CLIENT_ID", "MIRO_CLIENT_SECRET", "MIRO_WEBHOOK_SECRET"):
        monkeypatch.delenv(var, raising=False)

    root = Path(__file__).resolve().parents[1]
    example_dir = tmp_path / "config"
    example_dir.mkdir()
    shutil.copy(root / "config" / ".env.example", example_dir / ".env.example")
    shutil.copy(
        root / "config" / "config.example.yaml", example_dir / "config.example.yaml"
    )
    monkeypatch.chdir(tmp_path)

    with pytest.raises(RuntimeError):
        importlib.reload(config)

    assert (tmp_path / "config/.env").exists()
    assert (tmp_path / "config/config.yaml").exists()

    monkeypatch.chdir(root)
    monkeypatch.setenv("MIRO_CLIENT_ID", "test-client-id")
    monkeypatch.setenv("MIRO_CLIENT_SECRET", "test-client-secret")
    monkeypatch.setenv("MIRO_WEBHOOK_SECRET", "test-webhook-secret")
    importlib.reload(config)
