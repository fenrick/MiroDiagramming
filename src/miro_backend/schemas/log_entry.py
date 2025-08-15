"""Pydantic models for log entry payloads."""

from __future__ import annotations

from datetime import datetime
from html import escape
from typing import Any

from pydantic import BaseModel, Field, field_validator

MAX_MESSAGE_LEN = 1024
MAX_CONTEXT_ITEMS = 20
MAX_CONTEXT_VALUE_LEN = 1024


class LogEntryIn(BaseModel):
    """Log entry received from the client application."""

    timestamp: datetime
    level: str = Field(max_length=16)
    message: str = Field(max_length=MAX_MESSAGE_LEN)
    context: dict[str, str] | None = Field(default=None, max_length=None)

    @field_validator("level")
    @classmethod
    def normalise_level(cls, v: str) -> str:
        allowed = {"trace", "debug", "info", "warn", "error", "fatal"}
        cleaned = escape(v.strip().lower())
        if cleaned not in allowed:
            raise ValueError("invalid level")
        return cleaned

    @field_validator("message")
    @classmethod
    def sanitise_message(cls, v: str) -> str:
        if len(v) > MAX_MESSAGE_LEN:
            raise ValueError("message too long")
        return escape(v.strip())

    @field_validator("context", mode="before")
    @classmethod
    def sanitise_context(cls, v: Any) -> Any:
        if v is None:
            return None
        if not isinstance(v, dict):
            raise ValueError("context must be object")
        if len(v) > MAX_CONTEXT_ITEMS:
            raise ValueError("context too large")
        sanitized: dict[str, str] = {}
        for key, value in v.items():
            sanitized[escape(str(key))] = escape(str(value))[:MAX_CONTEXT_VALUE_LEN]
        return sanitized
