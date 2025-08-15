"""Endpoints for managing shapes on boards."""

from __future__ import annotations

from uuid import uuid4

from fastapi import APIRouter, Depends, Header, HTTPException, Response, status

from ...queue import (
    ChangeQueue,
    CreateShape,
    UpdateShape,
    DeleteShape,
    get_change_queue,
)
from ...schemas.shape import Shape, ShapeCreate, ShapeUpdate
from ...services.shape_store import ShapeStore, get_shape_store

router = APIRouter(prefix="/api/boards/{board_id}/shapes", tags=["shapes"])


def _verify_board(board_id: str, user_id: str | None, store: ShapeStore) -> None:
    owner = store.board_owner(board_id)
    if owner is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Board not found"
        )
    if user_id != owner:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Not board owner"
        )


@router.get("/{shape_id}", response_model=Shape)  # type: ignore[misc]
def get_shape(
    board_id: str,
    shape_id: str,
    user_id: str | None = Header(default=None, alias="X-User-Id"),
    store: ShapeStore = Depends(get_shape_store),
) -> Shape:
    """Return the specified shape if the requester owns the board."""

    _verify_board(board_id, user_id, store)
    shape = store.get(board_id, shape_id)
    if shape is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Shape not found"
        )
    return shape


@router.post("/", response_model=Shape, status_code=status.HTTP_201_CREATED)  # type: ignore[misc]
async def create_shape(
    board_id: str,
    payload: ShapeCreate,
    user_id: str | None = Header(default=None, alias="X-User-Id"),
    store: ShapeStore = Depends(get_shape_store),
    queue: ChangeQueue = Depends(get_change_queue),
) -> Shape:
    """Create a new shape and queue the change."""

    _verify_board(board_id, user_id, store)
    shape = Shape(id=str(uuid4()), **payload.model_dump())
    store.create(board_id, shape)
    await queue.enqueue(
        CreateShape(board_id=board_id, shape_id=shape.id, data=payload.model_dump())
    )
    return shape


@router.put("/{shape_id}", response_model=Shape)  # type: ignore[misc]
async def update_shape(
    board_id: str,
    shape_id: str,
    payload: ShapeUpdate,
    user_id: str | None = Header(default=None, alias="X-User-Id"),
    store: ShapeStore = Depends(get_shape_store),
    queue: ChangeQueue = Depends(get_change_queue),
) -> Shape:
    """Update an existing shape and queue the change."""

    _verify_board(board_id, user_id, store)
    if store.get(board_id, shape_id) is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Shape not found"
        )
    shape = Shape(id=shape_id, **payload.model_dump())
    store.update(board_id, shape)
    await queue.enqueue(
        UpdateShape(board_id=board_id, shape_id=shape_id, data=payload.model_dump())
    )
    return shape


@router.delete("/{shape_id}", status_code=status.HTTP_204_NO_CONTENT)  # type: ignore[misc]
async def delete_shape(
    board_id: str,
    shape_id: str,
    user_id: str | None = Header(default=None, alias="X-User-Id"),
    store: ShapeStore = Depends(get_shape_store),
    queue: ChangeQueue = Depends(get_change_queue),
) -> Response:
    """Delete a shape and queue the removal."""

    _verify_board(board_id, user_id, store)
    if store.get(board_id, shape_id) is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Shape not found"
        )
    store.delete(board_id, shape_id)
    await queue.enqueue(DeleteShape(board_id=board_id, shape_id=shape_id))
    return Response(status_code=status.HTTP_204_NO_CONTENT)
