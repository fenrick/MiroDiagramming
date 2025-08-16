"""Application configuration using environment variables and YAML files."""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any, cast

import yaml
from pydantic_settings import (
    BaseSettings,
    PydanticBaseSettingsSource,
    SettingsConfigDict,
)


class Settings(BaseSettings):
    """Defines runtime application settings."""

    database_url: str = "sqlite:///./app.db"
    cors_origins: list[str] = ["*"]
    miro_client_id: str = ""
    miro_client_secret: str = ""
    webhook_secret: str = "dev-secret"

    model_config = SettingsConfigDict(env_prefix="MIRO_", extra="ignore")

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


settings = Settings()
"""Singleton settings instance used throughout the application."""
