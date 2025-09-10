#!/usr/bin/env bash
set -euo pipefail

# Simple launcher for the FastAPI backend without Docker/Compose.
# - Verifies runtimes (Python 3.11+, Node 20 for UI build, Poetry)
# - Ensures config files exist (created automatically on first import)
# - Installs backend deps via Poetry if needed
# - Applies DB migrations if possible; falls back to SQLAlchemy create_all
# - Builds frontend (unless skipped) so FastAPI serves /static
# - Starts Uvicorn with reload

HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/.." && pwd)"
export PYTHONPATH="$ROOT/src:${PYTHONPATH:-}"

# Runtime checks
if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 is required (3.11+)." >&2; exit 1
fi
PY_VER_RAW=$(python3 -c 'import sys; print("%d.%d"%sys.version_info[:2])') || PY_VER_RAW="0.0"
PY_MAJ=${PY_VER_RAW%%.*}
PY_MIN=${PY_VER_RAW#*.}
if [ "${PY_MAJ:-0}" -lt 3 ] || { [ "${PY_MAJ:-0}" -eq 3 ] && [ "${PY_MIN:-0}" -lt 11 ]; }; then
  echo "Python ${PY_VER_RAW} detected; please use Python 3.11+ (pyenv/poetry recommended)." >&2
  exit 1
fi

if ! command -v poetry >/dev/null 2>&1; then
  echo "Poetry is required. Install: https://python-poetry.org/docs/#installation" >&2; exit 1
fi

# Optional overrides
PORT="${PORT:-8000}"
HOST="${HOST:-0.0.0.0}"
export MIRO_DATABASE_URL="${MIRO_DATABASE_URL:-sqlite:///./app.db}"

# Optional config file: pass as MIRO_CONFIG_FILE or --config FILE
while [[ $# -gt 0 ]]; do
  case "$1" in
    --config)
      export MIRO_CONFIG_FILE="$2"; shift 2 ;;
    *) echo "Unknown arg: $1" >&2; exit 2 ;;
  esac
done

# 1) Trigger settings load which creates default config files on first run
# Install backend dependencies (idempotent)
echo "Installing backend dependencies with Poetry..."
poetry install

echo "Checking configuration..."
python3 - <<'PY'
from miro_backend.core.config import settings  # noqa: F401  (triggers load)
print("Config ok")
PY

# 2) Try Alembic migrations, fall back to metadata.create_all
echo "Applying database schema..."
if poetry --version >/dev/null 2>&1; then
  POETRY="poetry run"
else
  POETRY=""
fi

set +e
$POETRY alembic -c config/alembic.ini upgrade heads
ALEMBIC_STATUS=$?
set -e

if [[ $ALEMBIC_STATUS -ne 0 ]]; then
  echo "Alembic failed (status=$ALEMBIC_STATUS); using SQLAlchemy create_all"
  python3 - <<'PY'
from miro_backend.db.session import Base, engine
Base.metadata.create_all(bind=engine)
print('SQLAlchemy metadata.create_all completed')
PY
fi

# 3) Build the frontend so FastAPI can serve /static (unless skipped)
if [[ "${SKIP_FRONTEND_BUILD:-false}" != "true" && -f "$ROOT/web/client/package.json" ]]; then
  if ! command -v node >/dev/null 2>&1; then
    echo "Node.js 20 is required to build the UI. Set SKIP_FRONTEND_BUILD=true to skip." >&2; exit 1
  fi
  NODE_VER=$(node -v 2>/dev/null | sed 's/^v//')
  NODE_MAJ=${NODE_VER%%.*}
  if [ "${NODE_MAJ:-0}" -lt 20 ]; then
    echo "Node ${NODE_VER} detected; please use Node 20.x to build the UI (or set SKIP_FRONTEND_BUILD=true)." >&2
    exit 1
  fi
  echo "Building frontend (Vite) for static serving..."
  VITE_BACKEND_URL="${VITE_BACKEND_URL:-http://localhost:${PORT}}" \
    npm --prefix "$ROOT/web/client" install
  VITE_BACKEND_URL="${VITE_BACKEND_URL:-http://localhost:${PORT}}" \
    npm --prefix "$ROOT/web/client" run build
  echo "Frontend built to web/client/dist (served at /static)."
fi

echo "Starting Uvicorn on ${HOST}:${PORT} ..."
exec $POETRY uvicorn src.miro_backend.main:app --reload --host "$HOST" --port "$PORT"
