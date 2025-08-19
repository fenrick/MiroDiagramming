"""Ensure schemas reject unknown fields."""

from __future__ import annotations

from datetime import datetime, timezone

import pytest
from pydantic import ValidationError

from miro_backend.schemas.tag import Tag
from miro_backend.schemas.job import Job
from miro_backend.schemas.user_info import UserInfo
from miro_backend.models import JobStatus


def test_tag_rejects_unknown_field() -> None:
    """Tag should forbid unexpected attributes."""

    with pytest.raises(ValidationError):
        Tag(id=1, board_id=2, name="t", unknown="x")


def test_job_rejects_unknown_field() -> None:
    """Job should forbid unexpected attributes."""

    with pytest.raises(ValidationError):
        Job(
            id="j1",
            status=JobStatus.QUEUED,
            updated_at=datetime(2024, 1, 1, tzinfo=timezone.utc),
            results=None,
            unknown="x",
        )


def test_user_info_rejects_unknown_field() -> None:
    """UserInfo should forbid unexpected attributes."""

    with pytest.raises(ValidationError):
        UserInfo(
            id="u1",
            name="name",
            access_token="a",
            refresh_token="r",
            expires_at=datetime(2030, 1, 1, tzinfo=timezone.utc),
            unknown="x",
        )
