"""Application entry point."""

from __future__ import annotations

import asyncio
import contextlib
from contextlib import asynccontextmanager
from pathlib import Path
from typing import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

from .api.routers.auth import router as auth_router
from .api.routers.tags import router as tags_router
from .queue import ChangeQueue
from .services.miro_client import MiroClient


change_queue = ChangeQueue()
"""Global queue used by the background worker."""


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    """Start a background worker that processes queued changes."""

    client = MiroClient()
    worker = asyncio.create_task(change_queue.worker(client))
    try:
        yield
    finally:
        worker.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await worker


BASE_DIR = Path(__file__).resolve().parents[2]
app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

static_dir = BASE_DIR / "web/client/dist"
if static_dir.exists():
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

app.include_router(auth_router)
app.include_router(tags_router)


@app.get("/", response_class=HTMLResponse)  # type: ignore[misc]
async def root() -> HTMLResponse:
    """Redirect browsers to the built front-end."""
    return HTMLResponse('<script>window.location.href="/static/index.html"</script>')


@app.get("/health")  # type: ignore[misc]
async def health() -> dict[str, str]:
    """Basic health check endpoint."""
    return {"status": "ok"}
