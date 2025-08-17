"""Pydantic models for batch change operations."""

from __future__ import annotations

from typing import Annotated, Any, Literal

from pydantic import BaseModel, ConfigDict, Field


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

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "operations": [
                    {
                        "type": "create_node",
                        "node_id": "n1",
                        "data": {"x": 0, "y": 0},
                    },
                    {
                        "type": "update_card",
                        "card_id": "c1",
                        "payload": {"title": "Updated"},
                    },
                ]
            }
        }
    )


class BatchResponse(BaseModel):
    """Summary of enqueued operations."""

    enqueued: int

    model_config = ConfigDict(json_schema_extra={"example": {"enqueued": 2}})
