"""Pydantic schema for job records."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


class Job(BaseModel):
    """Representation of a background job."""

    model_config = ConfigDict(extra="forbid", from_attributes=True)

    id: str
    status: str
    results: dict[str, Any] | None = None
    updated_at: datetime
