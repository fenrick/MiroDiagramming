"""Python translation of ``AuthControllerTests``."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional


@dataclass
class UserInfo:
    id: str
    name: str = ""


class StubStore:
    def __init__(self) -> None:
        self.users: dict[str, UserInfo] = {}

    def retrieve(self, user_id: str) -> Optional[UserInfo]:
        return self.users.get(user_id)

    def store(self, info: UserInfo) -> None:
        self.users[info.id] = info


class AuthController:
    def __init__(self, store: StubStore) -> None:
        self.store = store

    def get_status(self, user_id: str | None) -> int:
        if user_id is None:
            return 400
        return 200 if self.store.retrieve(user_id) else 404


def test_get_status_returns_ok_when_user_present() -> None:
    store = StubStore()
    store.store(UserInfo(id="u1"))
    controller = AuthController(store)
    assert controller.get_status("u1") == 200


def test_get_status_returns_not_found_for_missing_user() -> None:
    controller = AuthController(StubStore())
    assert controller.get_status("u2") == 404


def test_get_status_returns_bad_request_without_header() -> None:
    controller = AuthController(StubStore())
    assert controller.get_status(None) == 400
