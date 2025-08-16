"""Service for enqueuing board change operations."""

from __future__ import annotations

from collections.abc import Sequence
from typing import TYPE_CHECKING
from uuid import uuid4

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
) -> tuple[str, int]:
    """Convert ``operations`` into tasks and enqueue them.

    Args:
        operations: Validated operations to enqueue.
        queue: Target :class:`ChangeQueue`.

    Returns:
        Tuple of generated job identifier and number of enqueued operations.
    """

    job_id = str(uuid4())
    if queue.persistence is not None and hasattr(queue.persistence, "create_job"):
        await queue.persistence.create_job(job_id, len(operations))

    for index, op in enumerate(operations):
        task: ChangeTask
        if isinstance(op, CreateNodeOperation):
            task = CreateNode(
                node_id=op.node_id,
                data=op.data,
                user_id=user_id,
                job_id=job_id,
                index=index,
            )
        elif isinstance(op, UpdateCardOperation):
            task = UpdateCard(
                card_id=op.card_id,
                payload=op.payload,
                user_id=user_id,
                job_id=job_id,
                index=index,
            )
        else:  # pragma: no cover - safeguarded by Pydantic validation
            continue
        await queue.enqueue(task)
    return job_id, len(operations)
