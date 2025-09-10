#!/usr/bin/env bash
set -euo pipefail

export PYTHONPATH="$(pwd):${PYTHONPATH:-}"

# Apply database schema (Alembic if possible, else create_all)
echo "Applying database schema..."
set +e
poetry run alembic -c config/alembic.ini upgrade heads
STATUS=$?
set -e
if [ "$STATUS" -ne 0 ]; then
  echo "Alembic failed (status=$STATUS); falling back to SQLAlchemy create_all"
  poetry run python - <<'PY'
from miro_backend.db.session import Base, engine
Base.metadata.create_all(bind=engine)
print('SQLAlchemy metadata.create_all completed')
PY
fi

# Start FastAPI backend
poetry run uvicorn src.miro_backend.main:app --reload --port 8000 &
API_PID=$!

# Start Vite development server if frontend exists
if [ -f web/client/package.json ]; then
  (cd web/client && npm run dev) &
  FRONTEND_PID=$!
fi

cleanup() {
  kill $API_PID ${FRONTEND_PID-} 2>/dev/null || true
}
trap cleanup EXIT

# Wait for any process to exit
wait -n $API_PID ${FRONTEND_PID-}
