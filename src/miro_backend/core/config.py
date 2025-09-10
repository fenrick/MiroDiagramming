"""Application configuration using environment variables and YAML files."""

from __future__ import annotations

import os
from pathlib import Path
from shutil import copyfile
from typing import Any, cast

import yaml
from pydantic import Field, SecretStr, ValidationError
from pydantic_settings import (
    BaseSettings,
    PydanticBaseSettingsSource,
    SettingsConfigDict,
)


class Settings(BaseSettings):
    """Defines runtime application settings."""

    database_url: str = Field(
        default="sqlite:///./app.db",
        alias="MIRO_DATABASE_URL",
        description="Database connection URL.",
    )
    cors_origins: list[str] = Field(
        default=["*"],
        alias="MIRO_CORS_ORIGINS",
        description="List of allowed CORS origins.",
    )
    api_url: str = Field(
        default="",
        alias="MIRO_API_URL",
        description="Server URL advertised in the OpenAPI document.",
    )
    client_id: str = Field(
        alias="MIRO_CLIENT_ID",
        description="OAuth client identifier issued by Miro.",
    )
    client_secret: SecretStr = Field(
        alias="MIRO_CLIENT_SECRET",
        description="OAuth client secret issued by Miro.",
    )
    webhook_secret: SecretStr = Field(
        alias="MIRO_WEBHOOK_SECRET",
        description="Secret token used to verify Miro webhooks.",
    )
    oauth_auth_base: str = Field(
        default="https://miro.com/oauth/authorize",
        alias="MIRO_OAUTH_AUTH_BASE",
        description="Base URL for the Miro OAuth authorization endpoint.",
    )
    oauth_token_url: str = Field(
        default="https://api.miro.com/v1/oauth/token",
        alias="MIRO_OAUTH_TOKEN_URL",
        description="Miro OAuth token endpoint for exchanging authorization codes.",
    )
    oauth_scope: str = Field(
        default="boards:read boards:write",
        alias="MIRO_OAUTH_SCOPE",
        description="Space-separated list of OAuth scopes requested.",
    )
    oauth_redirect_uri: str = Field(
        alias="MIRO_OAUTH_REDIRECT_URI",
        description="Callback URL registered with Miro for OAuth redirects.",
    )
    encryption_key: str | None = Field(
        default=None,
        alias="MIRO_ENCRYPTION_KEY",
        description="Base64-encoded 32-byte key for encrypting tokens.",
    )
    logfire_service_name: str = Field(
        default="miro-backend",
        alias="MIRO_LOGFIRE_SERVICE_NAME",
        description="Service name reported to Logfire.",
    )
    logfire_send_to_logfire: bool = Field(
        default=False,
        alias="MIRO_LOGFIRE_SEND_TO_LOGFIRE",
        description="Whether to send logs to Logfire.",
    )
    log_max_entries: int = Field(
        default=1000,
        alias="MIRO_LOG_MAX_ENTRIES",
        description="Maximum number of log entries per request.",
    )
    log_max_payload_bytes: int = Field(
        default=1_048_576,
        alias="MIRO_LOG_MAX_PAYLOAD_BYTES",
        description="Maximum size of log payload in bytes.",
    )
    http_timeout_seconds: float = Field(
        default=10.0,
        alias="MIRO_HTTP_TIMEOUT_SECONDS",
        description="Default timeout in seconds for outbound HTTP requests.",
    )
    use_miro_sdk: bool = Field(
        default=False,
        alias="MIRO_USE_SDK",
        description="Use official Miro SDK for OAuth exchange.",
    )
    bucket_reservoir: int = Field(
        default=1,
        alias="MIRO_BUCKET_RESERVOIR",
        description="Maximum number of tokens in the soft rate limiter.",
    )
    bucket_refresh_ms: int = Field(
        default=600,
        alias="MIRO_BUCKET_REFRESH_MS",
        description="Interval in milliseconds for refilling the token bucket.",
    )
    idempotency_cleanup_seconds: float = Field(
        default=60 * 60 * 24,
        alias="MIRO_IDEMPOTENCY_CLEANUP_SECONDS",
        description="Interval in seconds between idempotency cleanup runs.",
    )
    idempotency_cache_size: int = Field(
        default=128,
        alias="MIRO_IDEMPOTENCY_CACHE_SIZE",
        description="Maximum number of idempotent responses to cache in memory.",
    )
    idempotency_cache_ttl_seconds: float = Field(
        default=60.0,
        alias="MIRO_IDEMPOTENCY_CACHE_TTL_SECONDS",
        description="Time-to-live for cached idempotent responses in seconds.",
    )
    cache_cleanup_seconds: float = Field(
        default=60 * 60 * 24,
        alias="MIRO_CACHE_CLEANUP_SECONDS",
        description="Interval in seconds between cache cleanup runs.",
    )
    cache_ttl_seconds: float = Field(
        default=60 * 60 * 24,
        alias="MIRO_CACHE_TTL_SECONDS",
        description="Maximum age in seconds for cached board state.",
    )

    model_config = SettingsConfigDict(
        env_file="config/.env", extra="ignore", populate_by_name=True
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

        The path defaults to ``config/config.yaml`` but may be overridden by the
        ``MIRO_CONFIG_FILE`` environment variable.
        """

        path_str = os.getenv("MIRO_CONFIG_FILE", "config/config.yaml")
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
    config_path = Path(os.getenv("MIRO_CONFIG_FILE", "config/config.yaml"))
    config_example = Path("config/config.example.yaml")
    if not config_path.exists() and config_example.exists():
        config_path.parent.mkdir(parents=True, exist_ok=True)
        copyfile(config_example, config_path)
        created.append(str(config_path))

    env_path = Path("config/.env")
    env_example = Path("config/.env.example")
    if not env_path.exists() and env_example.exists():
        env_path.parent.mkdir(parents=True, exist_ok=True)
        copyfile(env_example, env_path)
        created.append(str(env_path))

    return created


def load_settings() -> Settings:
    """Load application settings, creating defaults on first run."""

    try:
        return Settings()  # type: ignore[call-arg]
    except ValidationError:
        created = _create_default_config_files()
        if created:
            # Try loading again now that defaults exist; this allows a smooth
            # first-run experience using example values.
            try:
                return Settings()  # type: ignore[call-arg]
            except ValidationError as exc2:  # pragma: no cover - defensive
                files = ", ".join(created)
                raise RuntimeError(
                    f"Created default configuration files: {files}. "
                    "Please customise them with your values and re-run."
                ) from exc2
        raise


settings = load_settings()
"""Singleton settings instance used throughout the application."""
