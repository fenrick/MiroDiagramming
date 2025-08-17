#!/usr/bin/env bash
set -euo pipefail

export PYTHONPATH="$(pwd):${PYTHONPATH:-}"

# Apply database migrations
echo "Applying database migrations..."
poetry run alembic upgrade head

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
