"""Pydantic model for tag data."""

from pydantic import BaseModel, ConfigDict


class Tag(BaseModel):
    """Serialised representation of a :class:`~miro_backend.models.tag.Tag`."""

    id: int
    board_id: int
    name: str

    model_config = ConfigDict(from_attributes=True)
