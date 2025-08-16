from importlib import reload

from cryptography.fernet import Fernet
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from miro_backend.api.routers import oauth
from miro_backend.db.session import engine
from miro_backend.models.user import User
from miro_backend.services.miro_client import MiroClient
from miro_backend.services.user_store import InMemoryUserStore, get_user_store
from miro_backend.core import config
from miro_backend.services import crypto as crypto_module


class StubClient(MiroClient):  # type: ignore[misc]
    async def exchange_code(
        self,
        code: str,
        redirect_uri: str,
        token_url: str,
        client_id: str,
        client_secret: str,
        timeout_seconds: float | None = None,
    ) -> dict[str, int | str]:
        return {"access_token": "tok", "refresh_token": "ref", "expires_in": 3600}


def setup_app() -> tuple[TestClient, InMemoryUserStore]:
    app = FastAPI()
    app.include_router(oauth.router)
    store = InMemoryUserStore()
    stub = StubClient()
    cfg = oauth.OAuthConfig(
        auth_base="http://auth",
        client_id="id",
        client_secret="secret",
        redirect_uri="http://redir",
        scope="boards:read boards:write",
        token_url="http://token",
        timeout_seconds=60,
    )
    app.dependency_overrides[get_user_store] = lambda: store
    app.dependency_overrides[oauth.get_miro_client] = lambda: stub
    app.dependency_overrides[oauth.get_oauth_config] = lambda: cfg
    return TestClient(app), store


def test_tokens_are_encrypted() -> None:
    key = Fernet.generate_key().decode()
    config.settings.encryption_key = key
    reload(crypto_module)
    client, _ = setup_app()
    User.__table__.create(bind=engine, checkfirst=True)
    try:
        res = client.get(
            "/oauth/callback",
            params={"code": "c", "state": "x:u1"},
            allow_redirects=False,
        )
        assert res.status_code == 307
        with Session(bind=engine) as db:
            user = db.query(User).filter_by(user_id="u1").one()
            assert user.access_token != "tok"
            assert user.refresh_token != "ref"
            assert crypto_module.decrypt(user.access_token) == "tok"
            assert crypto_module.decrypt(user.refresh_token) == "ref"
    finally:
        config.settings.encryption_key = None
        reload(crypto_module)
        User.__table__.drop(bind=engine)
