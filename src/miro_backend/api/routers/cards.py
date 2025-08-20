"""Card endpoints migrated from the C# ``CardsController``."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Header, status
import logfire

from ...queue import ChangeQueue, get_change_queue
from ...schemas.card_create import CardCreate

router = APIRouter(prefix="/api/cards", tags=["cards"])


@router.post("", status_code=status.HTTP_202_ACCEPTED)
async def create_cards(
    cards: list[CardCreate],
    user_id: str = Header(alias="X-User-Id"),
    queue: ChangeQueue = Depends(get_change_queue),
) -> dict[str, int]:
    """Queue tasks that create the supplied ``cards``."""

    with logfire.span("create cards", count=len(cards)):
        for card in cards:
            await queue.enqueue(card.to_task(user_id))
        logfire.info("cards queued", count=len(cards))  # event after enqueuing tasks
        return {"accepted": len(cards)}
