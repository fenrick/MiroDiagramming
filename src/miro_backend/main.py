import argparse
import asyncio
import contextlib
import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import AsyncIterator

from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

import logfire
from prometheus_client import CONTENT_TYPE_LATEST, generate_latest
from prometheus_fastapi_instrumentator import Instrumentator

# Parse configuration file argument before importing modules that rely on it.
parser = argparse.ArgumentParser(add_help=False)
parser.add_argument("--config")
args, _ = parser.parse_known_args()
if args.config:
    os.environ["MIRO_CONFIG_FILE"] = args.config

from .core.config import settings  # noqa: E402
from .core.exceptions import add_exception_handlers  # noqa: E402
from .core.logging import configure_logging, setup_fastapi  # noqa: E402
from .core.security import setup_security  # noqa: E402
from .core.telemetry import setup_telemetry  # noqa: E402
from .queue import get_change_queue  # noqa: E402
from .services.miro_client import MiroClient  # noqa: E402

change_queue = get_change_queue()

# Configure structured logging and database instrumentation.
configure_logging()

# Routers are imported after the queue to avoid circular dependencies.
from .api.routers.auth import router as auth_router  # noqa: E402
from .api.routers.batch import router as batch_router  # noqa: E402
from .api.routers.cache import router as cache_router  # noqa: E402
from .api.routers.cards import router as cards_router  # noqa: E402
from .api.routers.logs import router as logs_router  # noqa: E402
from .api.routers.oauth import router as oauth_router  # noqa: E402
from .api.routers.shapes import router as shapes_router  # noqa: E402
from .api.routers.tags import router as tags_router  # noqa: E402
from .api.routers.users import router as users_router  # noqa: E402
from .api.routers.webhook import router as webhook_router  # noqa: E402


@asynccontextmanager
@logfire.instrument("application lifespan", allow_generator=True)  # type: ignore[misc]
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    """Start a background worker that processes queued changes."""

    client = MiroClient()
    worker = asyncio.create_task(change_queue.worker(client))
    try:
        logfire.info("change worker started")  # event for worker start
        yield
    finally:
        worker.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await worker
        logfire.info("change worker stopped")  # event for worker shutdown


BASE_DIR = Path(__file__).resolve().parents[2]
app = FastAPI(lifespan=lifespan)

# Instrument FastAPI and register middleware and handlers
setup_fastapi(app)
setup_security(app)
setup_telemetry(app)
add_exception_handlers(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

static_dir = BASE_DIR / "web/client/dist"
if static_dir.exists():
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

app.include_router(auth_router)
app.include_router(webhook_router)
app.include_router(users_router)
app.include_router(tags_router)
app.include_router(shapes_router)
app.include_router(oauth_router)
app.include_router(logs_router)
app.include_router(cards_router)
app.include_router(cache_router)
app.include_router(batch_router)

instrumentator = Instrumentator().instrument(app)


@app.get("/metrics")  # type: ignore[misc]
async def metrics() -> Response:
    """Expose Prometheus metrics."""
    with logfire.span("prometheus scrape"):
        return Response(
            generate_latest(instrumentator.registry),
            media_type=CONTENT_TYPE_LATEST,
        )


@app.get("/", response_class=HTMLResponse)  # type: ignore[misc]
async def root() -> HTMLResponse:
    """Redirect browsers to the built front-end."""
    with logfire.span("root redirect"):
        logfire.info("redirecting to frontend")  # event for root redirect
        return HTMLResponse(
            '<script>window.location.href="/static/index.html"</script>'
        )


@app.get("/health")  # type: ignore[misc]
async def health() -> dict[str, str]:
    """Basic health check endpoint."""
    with logfire.span("health check"):
        logfire.info("health ok")  # event for health status
        return {"status": "ok"}
