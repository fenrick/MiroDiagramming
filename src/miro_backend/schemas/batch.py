"""Pydantic models for batch change operations."""

from __future__ import annotations

from typing import Annotated, Any, Literal

from pydantic import BaseModel, Field, ConfigDict


class CreateNodeOperation(BaseModel):
    """Request to create a new node on the board."""

    model_config = ConfigDict(extra="forbid")

    type: Literal["create_node"] = Field(
        description="Discriminator for the operation type"
    )
    node_id: str
    data: dict[str, Any]


class UpdateCardOperation(BaseModel):
    """Request to update an existing card."""

    model_config = ConfigDict(extra="forbid")

    type: Literal["update_card"] = Field(
        description="Discriminator for the operation type"
    )
    card_id: str
    payload: dict[str, Any]


Operation = Annotated[
    CreateNodeOperation | UpdateCardOperation, Field(discriminator="type")
]


class BatchRequest(BaseModel):
    """Incoming batch of operations to process."""

    model_config = ConfigDict(extra="forbid")

    operations: list[Operation]


class BatchResponse(BaseModel):
    """Summary of enqueued operations."""

    enqueued: int
    job_id: str
