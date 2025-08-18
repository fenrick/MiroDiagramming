"""Pydantic models representing shapes."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict


class ShapeBase(BaseModel):
    """Common attributes shared by all shape representations."""

    model_config = ConfigDict(extra="forbid")

    content: str


class ShapeCreate(ShapeBase):
    """Payload required to create a new shape."""


class ShapeUpdate(ShapeBase):
    """Payload used to update an existing shape."""


class Shape(ShapeBase):
    """A shape stored on a board."""

    id: str
