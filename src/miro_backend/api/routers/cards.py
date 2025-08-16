"""Card endpoints migrated from the C# ``CardsController``."""

from __future__ import annotations

from fastapi import APIRouter, Depends, status
import logfire

from ...queue import ChangeQueue, get_change_queue
from ...schemas.card_create import CardCreate

router = APIRouter(prefix="/api/cards", tags=["cards"])


@router.post("", status_code=status.HTTP_202_ACCEPTED)  # type: ignore[misc]
async def create_cards(
    cards: list[CardCreate],
    queue: ChangeQueue = Depends(get_change_queue),
) -> dict[str, int]:
    """Queue tasks that create the supplied ``cards``."""

    with logfire.span("create cards", count=len(cards)):
        for card in cards:
            await queue.enqueue(card.to_task())
        logfire.info("cards queued", count=len(cards))  # event after enqueuing tasks
        return {"accepted": len(cards)}
