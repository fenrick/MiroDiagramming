"""Endpoints for managing shapes on boards."""

from __future__ import annotations

from uuid import uuid4

from fastapi import APIRouter, Depends, Header, Response, status
import logfire

from ...core.exceptions import ForbiddenError, NotFoundError

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
    with logfire.span("verify board", board_id=board_id):
        owner = store.board_owner(board_id)
        if owner is None:
            logfire.warning(
                "board missing", board_id=board_id
            )  # warn when board is absent
            raise NotFoundError("Board not found")
        if user_id != owner:
            logfire.warning(
                "not board owner", board_id=board_id, user_id=user_id, owner=owner
            )  # warn about ownership mismatch
            raise ForbiddenError("Not board owner")
        logfire.info(
            "board verified", board_id=board_id, user_id=user_id
        )  # event on success


@router.get("/{shape_id}", response_model=Shape)  # type: ignore[misc]
def get_shape(
    board_id: str,
    shape_id: str,
    user_id: str | None = Header(default=None, alias="X-User-Id"),
    store: ShapeStore = Depends(get_shape_store),
) -> Shape:
    """Return the specified shape if the requester owns the board."""

    with logfire.span("get shape", shape_id=shape_id):
        _verify_board(board_id, user_id, store)
        shape = store.get(board_id, shape_id)
        if shape is None:
            logfire.warning(
                "shape missing", board_id=board_id, shape_id=shape_id
            )  # warn when requested shape absent
            raise NotFoundError("Shape not found")
        logfire.info(
            "shape retrieved", board_id=board_id, shape_id=shape_id
        )  # event after successful lookup
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

    with logfire.span("create shape"):
        _verify_board(board_id, user_id, store)
        assert user_id is not None
        shape = Shape(id=str(uuid4()), **payload.model_dump())
        store.create(board_id, shape)
        with logfire.span(
            "enqueue shape create", shape_id=shape.id
        ):  # span for queueing create
            await queue.enqueue(
                CreateShape(
                    board_id=board_id,
                    shape_id=shape.id,
                    data=payload.model_dump(),
                    user_id=user_id,
                )
            )
        logfire.info(
            "shape created", board_id=board_id, shape_id=shape.id
        )  # event after storing and queuing
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

    with logfire.span("update shape", shape_id=shape_id):
        _verify_board(board_id, user_id, store)
        if store.get(board_id, shape_id) is None:
            logfire.warning(
                "shape missing", board_id=board_id, shape_id=shape_id
            )  # warn when shape absent for update
            raise NotFoundError("Shape not found")
        assert user_id is not None
        shape = Shape(id=shape_id, **payload.model_dump())
        store.update(board_id, shape)
        with logfire.span(
            "enqueue shape update", shape_id=shape_id
        ):  # span for queueing update
            await queue.enqueue(
                UpdateShape(
                    board_id=board_id,
                    shape_id=shape_id,
                    data=payload.model_dump(),
                    user_id=user_id,
                )
            )
        logfire.info(
            "shape updated", board_id=board_id, shape_id=shape_id
        )  # event after update
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
        logfire.warning(
            "shape missing", board_id=board_id, shape_id=shape_id
        )  # warn when shape absent for deletion
        raise NotFoundError("Shape not found")
    assert user_id is not None
    store.delete(board_id, shape_id)
    with logfire.span(
        "enqueue shape delete", shape_id=shape_id
    ):  # span for queueing delete
        await queue.enqueue(
            DeleteShape(board_id=board_id, shape_id=shape_id, user_id=user_id)
        )
    logfire.info(
        "shape deleted", board_id=board_id, shape_id=shape_id
    )  # event after removal
    return Response(status_code=status.HTTP_204_NO_CONTENT)
