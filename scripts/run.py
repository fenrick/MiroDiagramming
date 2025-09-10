"""Single unified application runner for the Miro app.

This launches the whole application (API + built web UI served by FastAPI)
from one entry point. It also handles database migrations and building the
frontend when needed.

Examples
  - Development (auto-reload):
      poetry run python scripts/run.py --reload

  - Production (multi-worker, no reload):
      poetry run python scripts/run.py --host 0.0.0.0 --port 3000 --workers 4

  - Ensure the UI is built before starting (default builds if missing):
      poetry run python scripts/run.py --build-frontend

  - Rebuild the npm environment and frontend:
      poetry run python scripts/run.py --rebuild-npm
"""

from __future__ import annotations

import argparse
import asyncio
import os
import shutil
import sys
from pathlib import Path


def _ensure_src_on_path() -> None:
    repo_root = Path(__file__).resolve().parent.parent
    src = repo_root / "src"
    if str(src) not in sys.path:
        sys.path.insert(0, str(src))


_ensure_src_on_path()

from sqlalchemy import create_engine, inspect, text  # noqa: E402

try:
    from alembic import command  # noqa: E402
    from alembic.config import Config  # noqa: E402
except Exception:  # pragma: no cover - helpful output
    print("Alembic is not installed; please install dependencies.")
    raise

from miro_backend.core.config import settings  # noqa: E402


def _alembic_config() -> Config:
    cfg = Config("config/alembic.ini")
    cfg.set_main_option("script_location", "src/miro_backend/db/migrations")
    cfg.set_main_option("sqlalchemy.url", settings.database_url)
    return cfg


def _detect_db_state() -> tuple[bool, bool, bool]:
    engine = create_engine(
        settings.database_url, connect_args={"check_same_thread": False}
    )
    insp = inspect(engine)
    has_version = insp.has_table("alembic_version")
    has_version_row = False
    if has_version:
        with engine.connect() as conn:
            try:
                count = conn.execute(text("select count(*) from alembic_version")).scalar()
                has_version_row = bool(count and int(count) > 0)
            except Exception:
                has_version_row = False
    known_tables = {
        "users",
        "cache_entries",
        "idempotency",
        "jobs",
        "boards",
        "shapes",
        "tags",
    }
    has_known = any(insp.has_table(t) for t in known_tables)
    return has_version, has_version_row, has_known


def apply_migrations() -> None:
    alembic_ini = Path("config/alembic.ini")
    if not alembic_ini.exists():
        from miro_backend.db.session import Base, engine

        Base.metadata.create_all(bind=engine)
        print("[app] Created tables via SQLAlchemy create_all", flush=True)
        return

    has_version, has_version_row, has_known = _detect_db_state()
    cfg = _alembic_config()
    if has_version and has_version_row:
        print("[app] Alembic version present; upgrading to heads...", flush=True)
        command.upgrade(cfg, "heads")
    elif has_version and not has_version_row and has_known:
        print("[app] Empty alembic_version; stamping heads...", flush=True)
        command.stamp(cfg, "heads")
    elif has_known and not has_version:
        print("[app] Tables exist without alembic_version; stamping heads...", flush=True)
        command.stamp(cfg, "heads")
    else:
        print("[app] Fresh DB; applying migrations to heads...", flush=True)
        command.upgrade(cfg, "heads")


def _has_node() -> bool:
    from shutil import which

    return which("npm") is not None


def _dist_has_app() -> bool:
    dist = Path("web/client/dist")
    # Consider it built if primary entry files exist
    return (dist / "app.html").is_file() or (dist / "index.html").is_file()


def _needs_frontend_build() -> bool:
    pkg = Path("web/client/package.json")
    if not pkg.is_file():
        return False
    # Build is needed if dist folder is missing or does not contain expected outputs
    return not _dist_has_app()


async def build_frontend_if_needed(force: bool) -> None:
    pkg = Path("web/client/package.json")
    if not pkg.is_file():
        # No frontend present; nothing to do.
        return
    if not force and _dist_has_app():
        return
    if not _has_node():
        print("[app] Node/NPM not found; skipping frontend build.", flush=True)
        return

    node_modules = Path("web/client/node_modules")
    if not node_modules.exists():
        print("[app] Installing frontend dependencies (npm install)...", flush=True)
        proc_install = await asyncio.create_subprocess_exec(
            "npm", "install", cwd=str(Path("web/client"))
        )
        rc = await proc_install.wait()
        if rc != 0:
            raise SystemExit(f"frontend npm install failed with code {rc}")

    print("[app] Building frontend (npm run build)...", flush=True)
    proc = await asyncio.create_subprocess_exec(
        "npm", "run", "build", cwd=str(Path("web/client"))
    )
    rc = await proc.wait()
    if rc != 0:
        raise SystemExit(f"frontend build failed with code {rc}")
    print("[app] Frontend build completed.", flush=True)


async def rebuild_npm_environment() -> None:
    """Reinstall frontend dependencies and clean dist outputs.

    - Removes `web/client/node_modules` and `web/client/dist` if present
    - Runs `npm ci` to install from the lockfile
    """
    pkg_dir = Path("web/client")
    pkg = pkg_dir / "package.json"
    if not pkg.is_file():
        return
    if not _has_node():
        print("[app] Node/NPM not found; cannot rebuild npm environment.", flush=True)
        return

    node_modules = pkg_dir / "node_modules"
    dist_dir = pkg_dir / "dist"

    if node_modules.exists():
        print("[app] Removing frontend node_modules...", flush=True)
        shutil.rmtree(node_modules, ignore_errors=True)
    if dist_dir.exists():
        print("[app] Removing frontend dist outputs...", flush=True)
        shutil.rmtree(dist_dir, ignore_errors=True)

    print("[app] Installing frontend dependencies (npm ci)...", flush=True)
    proc_ci = await asyncio.create_subprocess_exec("npm", "ci", cwd=str(pkg_dir))
    rc = await proc_ci.wait()
    if rc != 0:
        raise SystemExit(f"frontend npm ci failed with code {rc}")


async def _spawn_api(host: str, port: int, workers: int, reload: bool, log_level: str) -> asyncio.subprocess.Process:
    args = [
        sys.executable,
        "-m",
        "uvicorn",
        "miro_backend.main:app",
        "--host",
        host,
        "--port",
        str(port),
        "--log-level",
        log_level,
    ]
    if reload:
        args.append("--reload")
    else:
        args += ["--workers", str(workers)]

    env = os.environ.copy()
    repo_root = Path(__file__).resolve().parent.parent
    src = repo_root / "src"
    env["PYTHONPATH"] = f"{src}:{env.get('PYTHONPATH','')}"
    mode = "reload" if reload else f"{workers} workers"
    print(f"[app] Starting server on http://{host}:{port} ({mode})", flush=True)
    return await asyncio.create_subprocess_exec(*args, env=env)


async def run(args: argparse.Namespace) -> int:
    # Ensure DB is ready
    apply_migrations()
    # Optionally rebuild npm environment, then build UI
    if args.rebuild_npm:
        await rebuild_npm_environment()
        await build_frontend_if_needed(force=True)
    else:
        # Ensure UI is built (if present)
        await build_frontend_if_needed(force=args.build_frontend or _needs_frontend_build())
    # Start the app server
    api = await _spawn_api(args.host, args.port, args.workers, args.reload, args.log_level)
    rc = await api.wait()
    print(f"[app] Server exited with code {rc}", flush=True)
    return int(rc or 0)


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Unified application runner")
    parser.add_argument("--host", default="0.0.0.0", help="Bind host")
    parser.add_argument("--port", type=int, default=3000, help="Bind port")
    parser.add_argument("--workers", type=int, default=max(os.cpu_count() or 1, 1), help="Uvicorn workers (ignored with --reload)")
    parser.add_argument("--reload", action="store_true", help="Enable auto-reload (development mode)")
    parser.add_argument("--log-level", default="info", choices=["critical","error","warning","info","debug","trace"], help="Uvicorn log level")
    parser.add_argument("--build-frontend", action="store_true", help="Force building the frontend before start")
    parser.add_argument(
        "--rebuild-npm",
        action="store_true",
        help="Clean node_modules and dist, run 'npm ci', and rebuild frontend",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv or sys.argv[1:])
    return asyncio.run(run(args))


if __name__ == "__main__":  # pragma: no cover - CLI entry
    raise SystemExit(main())
