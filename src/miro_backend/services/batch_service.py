"""Service for enqueuing board change operations."""

from __future__ import annotations

from collections.abc import Sequence
from typing import TYPE_CHECKING

from ..queue.tasks import ChangeTask, CreateNode, UpdateCard

if TYPE_CHECKING:
    from ..queue.change_queue import ChangeQueue
from ..schemas.batch import (
    CreateNodeOperation,
    Operation,
    UpdateCardOperation,
)


async def enqueue_operations(
    operations: Sequence[Operation], queue: "ChangeQueue", user_id: str
) -> int:
    """Convert ``operations`` into tasks and enqueue them.

    Args:
        operations: Validated operations to enqueue.
        queue: Target :class:`ChangeQueue`.

    Returns:
        Number of enqueued operations.
    """

    for op in operations:
        task: ChangeTask
        if isinstance(op, CreateNodeOperation):
            task = CreateNode(node_id=op.node_id, data=op.data, user_id=user_id)
        elif isinstance(op, UpdateCardOperation):
            task = UpdateCard(card_id=op.card_id, payload=op.payload, user_id=user_id)
        else:  # pragma: no cover - safeguarded by Pydantic validation
            continue
        await queue.enqueue(task)
    return len(operations)
