"""Pydantic model mirroring the C# ``UserInfo`` record."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class UserInfo(BaseModel):
    """Authentication and OAuth token details of a Miro user."""

    id: str
    name: str
    access_token: str
    refresh_token: str
    expires_at: datetime
