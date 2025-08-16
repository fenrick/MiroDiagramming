"""Test helpers for queue implementations."""

from __future__ import annotations


class DummyQueue:
    """Simple queue capturing enqueued tasks."""

    def __init__(self) -> None:
        self.tasks: list[object] = []

    async def enqueue(self, task: object) -> None:
        self.tasks.append(task)

    async def dequeue(self) -> object:
        return self.tasks.pop(0)
