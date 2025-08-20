"""User endpoints migrated from the C# ``UsersController``."""

from __future__ import annotations

from fastapi import APIRouter, Depends, status
import logfire

from ...core.exceptions import ConflictError
from sqlalchemy.orm import Session

from ...db.session import get_session
from ...models.user import User
from ...schemas.user_info import UserInfo
from ...services import crypto
from ...services.repository import Repository

router = APIRouter(prefix="/api/users", tags=["users"])


@router.post("", status_code=status.HTTP_201_CREATED)
def create_user(info: UserInfo, session: Session = Depends(get_session)) -> UserInfo:
    """Persist ``info`` and return it, rejecting duplicates."""

    with logfire.span("create user"):
        if session.query(User).filter_by(user_id=info.id).first() is not None:
            logfire.warning(
                "user already exists", user_id=info.id
            )  # warn when duplicate user
            raise ConflictError("User already exists")

        repo: Repository[User] = Repository(session, User)
        user = User(
            user_id=info.id,
            name=info.name,
            access_token=crypto.encrypt(info.access_token),
            refresh_token=crypto.encrypt(info.refresh_token),
            expires_at=info.expires_at,
        )
        repo.add(user)
        logfire.info("user created", user_id=info.id)  # event after persisting user
        return info
