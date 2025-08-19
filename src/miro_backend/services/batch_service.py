"""Service for enqueuing board change operations."""

from __future__ import annotations

from collections.abc import Sequence
from typing import TYPE_CHECKING

from sqlalchemy.orm import Session

from ..models import Job, JobStatus
from ..queue.tasks import ChangeTask, CreateNode, UpdateCard
from ..services.repository import Repository

if TYPE_CHECKING:
    from ..queue.change_queue import ChangeQueue
from ..schemas.batch import (
    CreateNodeOperation,
    Operation,
    UpdateCardOperation,
)


async def enqueue_operations(
    operations: Sequence[Operation],
    queue: "ChangeQueue",
    user_id: str,
    session: Session,
) -> tuple[str, int]:
    """Convert ``operations`` into tasks, persist a job and enqueue them.

    Args:
        operations: Validated operations to enqueue.
        queue: Target :class:`ChangeQueue`.
        user_id: Identifier of the requestor.
        session: Database session used to persist the job record.

    Returns:
        Tuple of job identifier and number of enqueued operations.
    """

    repo: Repository[Job] = Repository(session, Job)
    job = repo.add(
        Job(
            status=JobStatus.QUEUED,
            results={"total": len(operations), "operations": []},
        )
    )

    for op in operations:
        task: ChangeTask
        if isinstance(op, CreateNodeOperation):
            task = CreateNode(
                node_id=op.node_id, data=op.data, user_id=user_id, job_id=job.id
            )
        elif isinstance(op, UpdateCardOperation):
            task = UpdateCard(
                card_id=op.card_id,
                payload=op.payload,
                user_id=user_id,
                job_id=job.id,
            )
        else:  # pragma: no cover - safeguarded by Pydantic validation
            continue
        await queue.enqueue(task)
    return job.id, len(operations)
