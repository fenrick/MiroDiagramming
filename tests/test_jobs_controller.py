from __future__ import annotations

import importlib

from fastapi.testclient import TestClient

from miro_backend.db.session import Base, SessionLocal, engine
from miro_backend.models import Job
from miro_backend.queue import ChangeQueue


def setup_module() -> None:
    Base.metadata.create_all(bind=engine)


def teardown_module() -> None:
    Base.metadata.drop_all(bind=engine)


def test_get_job_returns_record() -> None:
    session = SessionLocal()
    job = Job(status="pending")
    session.add(job)
    session.commit()
    job_id = job.id
    session.close()

    app_module = importlib.import_module("miro_backend.main")
    app_module.change_queue = ChangeQueue()  # type: ignore[attr-defined]
    with TestClient(app_module.app) as client:
        response = client.get(f"/api/jobs/{job_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == job_id
        assert data["status"] == "pending"
