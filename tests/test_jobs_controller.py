"""Tests for the jobs API."""

from __future__ import annotations

from uuid import uuid4

from fastapi.testclient import TestClient

from miro_backend.main import app
from miro_backend.db.session import Base, SessionLocal, engine
from miro_backend.models.job import Job


def test_get_job_returns_record() -> None:
    Base.metadata.create_all(bind=engine)
    job_id = uuid4()
    with SessionLocal() as session:
        session.add(Job(id=str(job_id), status="queued", results={}))
        session.commit()

    client = TestClient(app)
    response = client.get(f"/api/jobs/{job_id}")
    assert response.status_code == 200
    assert response.json()["id"] == str(job_id)
