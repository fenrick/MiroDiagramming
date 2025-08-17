from __future__ import annotations

import pytest

from miro_backend.core.config import Settings


def test_idempotency_cleanup_seconds_from_env(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.delenv("MIRO_IDEMPOTENCY_CLEANUP_SECONDS", raising=False)
    settings = Settings()
    assert settings.idempotency_cleanup_seconds == 60 * 60 * 24

    monkeypatch.setenv("MIRO_IDEMPOTENCY_CLEANUP_SECONDS", "123")
    settings = Settings()
    assert settings.idempotency_cleanup_seconds == 123
