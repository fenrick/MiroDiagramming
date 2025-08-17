from __future__ import annotations

import pytest

from miro_backend.core.config import Settings


def test_bucket_settings_from_env(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("MIRO_BUCKET_RESERVOIR", "3")
    monkeypatch.setenv("MIRO_BUCKET_REFRESH_MS", "50")

    settings = Settings()

    assert settings.bucket_reservoir == 3
    assert settings.bucket_refresh_ms == 50
