"""Pydantic models for batch change operations."""

from __future__ import annotations

from typing import Annotated, Any, Literal

from pydantic import BaseModel, Field


class CreateNodeOperation(BaseModel):
    """Request to create a new node on the board."""

    type: Literal["create_node"] = Field(
        description="Discriminator for the operation type"
    )
    node_id: str
    data: dict[str, Any]


class UpdateCardOperation(BaseModel):
    """Request to update an existing card."""

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

    operations: list[Operation]


class BatchResponse(BaseModel):
    """Summary of enqueued operations."""

    job_id: str
    enqueued: int
