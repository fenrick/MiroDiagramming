"""User endpoints migrated from the C# ``UsersController``."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...db.session import get_session
from ...models.user import User
from ...schemas.user_info import UserInfo
from ...services.repository import Repository

router = APIRouter(prefix="/api/users", tags=["users"])


@router.post("", status_code=status.HTTP_201_CREATED)  # type: ignore[misc]
def create_user(info: UserInfo, session: Session = Depends(get_session)) -> UserInfo:
    """Persist ``info`` and return it, rejecting duplicates."""

    if session.query(User).filter_by(user_id=info.id).first() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User already exists",
        )

    repo: Repository[User] = Repository(session, User)
    user = User(
        user_id=info.id,
        name=info.name,
        access_token=info.access_token,
        refresh_token=info.refresh_token,
        expires_at=info.expires_at,
    )
    repo.add(user)
    return info
