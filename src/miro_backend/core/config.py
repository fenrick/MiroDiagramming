"""Application configuration using environment variables and YAML files."""

from __future__ import annotations

import os
from pathlib import Path
from shutil import copyfile
from typing import Any, cast

import yaml
from pydantic import SecretStr, ValidationError
from pydantic_settings import (
    BaseSettings,
    PydanticBaseSettingsSource,
    SettingsConfigDict,
)


class Settings(BaseSettings):
    """Defines runtime application settings."""

    database_url: str = "sqlite:///./app.db"
    cors_origins: list[str] = ["*"]
    client_id: str
    client_secret: SecretStr
    webhook_secret: SecretStr
    redirect_uri: str
    logfire_service_name: str = "miro-backend"
    logfire_send_to_logfire: bool = False
    http_timeout_seconds: float = 10.0

    model_config = SettingsConfigDict(
        env_prefix="MIRO_", env_file=".env", extra="ignore"
    )

    @classmethod
    def settings_customise_sources(
        cls,
        settings_cls: type[BaseSettings],
        init_settings: PydanticBaseSettingsSource,
        env_settings: PydanticBaseSettingsSource,
        dotenv_settings: PydanticBaseSettingsSource,
        file_secret_settings: PydanticBaseSettingsSource,
    ) -> tuple[PydanticBaseSettingsSource, ...]:
        """Load configuration from env vars with optional YAML file."""

        return (
            init_settings,
            env_settings,
            dotenv_settings,
            cast(PydanticBaseSettingsSource, cls._yaml_config_settings),
            file_secret_settings,
        )

    @staticmethod
    def _yaml_config_settings() -> dict[str, Any]:
        """Read settings from a YAML file if it exists.

        The path defaults to ``config.yaml`` but may be overridden by the
        ``MIRO_CONFIG_FILE`` environment variable.
        """

        path_str = os.getenv("MIRO_CONFIG_FILE", "config.yaml")
        path = Path(path_str)
        if path.is_file():
            with path.open(encoding="utf-8") as fh:
                data = yaml.safe_load(fh) or {}
                if not isinstance(data, dict):  # pragma: no cover - defensive
                    raise ValueError("Configuration file must define a mapping")
                return data
        return {}


def _create_default_config_files() -> list[str]:
    """Create default configuration files from examples if missing.

    Returns
    -------
    list[str]
        Names of files that were created.
    """

    created: list[str] = []
    config_path = Path(os.getenv("MIRO_CONFIG_FILE", "config.yaml"))
    config_example = Path("config.example.yaml")
    if not config_path.exists() and config_example.exists():
        copyfile(config_example, config_path)
        created.append(str(config_path))

    env_path = Path(".env")
    env_example = Path(".env.example")
    if not env_path.exists() and env_example.exists():
        copyfile(env_example, env_path)
        created.append(str(env_path))

    return created


def load_settings() -> Settings:
    """Load application settings, creating defaults on first run."""

    try:
        return Settings()  # type: ignore[call-arg]
    except ValidationError as exc:
        created = _create_default_config_files()
        if created:
            files = ", ".join(created)
            raise RuntimeError(
                f"Created default configuration files: {files}. "
                "Please customise them with your values and re-run."
            ) from exc
        raise


settings = load_settings()
"""Singleton settings instance used throughout the application."""
