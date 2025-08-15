"""Queue utilities for processing board changes."""

from .change_queue import ChangeQueue
from .tasks import (
    ChangeTask,
    CreateNode,
    UpdateCard,
    CreateShape,
    UpdateShape,
    DeleteShape,
)

_queue = ChangeQueue()


def get_change_queue() -> ChangeQueue:
    """Provide the global change queue instance."""

    return _queue

from .provider import get_change_queue
from .tasks import ChangeTask, CreateNode, UpdateCard

__all__ = [
    "ChangeQueue",
    "ChangeTask",
    "CreateNode",
    "UpdateCard",
    "CreateShape",
    "UpdateShape",
    "DeleteShape",
    "get_change_queue",
]
