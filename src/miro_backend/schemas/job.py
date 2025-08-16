"""Schemas for job resources."""

from __future__ import annotations

from datetime import datetime
from uuid import UUID
from typing import Any

from pydantic import BaseModel


class JobRead(BaseModel):
    """Representation of a background job."""

    id: UUID
    status: str
    results: dict[str, Any] | None = None
    updated_at: datetime
