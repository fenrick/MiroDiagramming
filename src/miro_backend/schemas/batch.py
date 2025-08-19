"""Pydantic models for batch change operations."""

from __future__ import annotations

from typing import Annotated, Any, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

MAX_BATCH_OPERATIONS = 500


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

    @field_validator("operations")
    @classmethod
    def _enforce_operation_limit(cls, value: list[Operation]) -> list[Operation]:
        if len(value) > MAX_BATCH_OPERATIONS:
            msg = f"Batch cannot exceed {MAX_BATCH_OPERATIONS} operations"
            raise ValueError(msg)
        return value


class BatchResponse(BaseModel):
    """Summary of enqueued operations."""

    enqueued: int
    job_id: str
