"""Configuration tests for cache cleanup settings."""

from __future__ import annotations

import pytest

from miro_backend.core.config import Settings


def test_cache_cleanup_seconds_from_env(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("MIRO_CACHE_CLEANUP_SECONDS", raising=False)
    settings = Settings()
    assert settings.cache_cleanup_seconds == 60 * 60 * 24

    monkeypatch.setenv("MIRO_CACHE_CLEANUP_SECONDS", "123")
    settings = Settings()
    assert settings.cache_cleanup_seconds == 123


def test_cache_ttl_seconds_from_env(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("MIRO_CACHE_TTL_SECONDS", raising=False)
    settings = Settings()
    assert settings.cache_ttl_seconds == 60 * 60 * 24

    monkeypatch.setenv("MIRO_CACHE_TTL_SECONDS", "321")
    settings = Settings()
    assert settings.cache_ttl_seconds == 321
