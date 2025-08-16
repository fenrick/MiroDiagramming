from importlib import reload
from datetime import datetime, timezone

from cryptography.fernet import Fernet
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from miro_backend.api.routers import users
from miro_backend.core import config
from miro_backend.db.session import engine
from miro_backend.models.user import User
from miro_backend.services import crypto as crypto_module


def setup_app() -> TestClient:
    app = FastAPI()
    app.include_router(users.router)
    return TestClient(app)


def test_tokens_are_encrypted() -> None:
    key = Fernet.generate_key().decode()
    config.settings.encryption_key = key
    reload(crypto_module)
    client = setup_app()
    User.__table__.create(bind=engine, checkfirst=True)
    try:
        payload = {
            "id": "u1",
            "name": "Alice",
            "access_token": "tok",
            "refresh_token": "ref",
            "expires_at": datetime.now(timezone.utc).isoformat(),
        }
        res = client.post("/api/users", json=payload)
        assert res.status_code == 201
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
