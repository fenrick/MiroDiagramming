#!/usr/bin/env sh
set -e

# Ensure DB_URL is set for Alembic, defaulting to MIRO_DATABASE_URL
export DB_URL="${DB_URL:-${MIRO_DATABASE_URL:-sqlite:////data/app.db}}"
# Ensure Python can import from src/ for Alembic and Uvicorn
export PYTHONPATH="/app/src:${PYTHONPATH:-}"

if [ "${RUN_ALEMBIC:-false}" = "true" ]; then
  echo "Running database migrations (Alembic)..."
  alembic -c config/alembic.ini upgrade heads || {
    echo "Alembic upgrade failed; falling back to SQLAlchemy create_all";
  }
fi

echo "Ensuring database schema exists via SQLAlchemy..."
python - <<'PY'
import os
os.environ.setdefault('MIRO_DATABASE_URL', os.environ.get('DB_URL','sqlite:////data/app.db'))
from miro_backend.db.session import Base, engine
Base.metadata.create_all(bind=engine)
print('SQLAlchemy metadata.create_all completed')
PY

echo "Starting API server..."
exec uvicorn src.miro_backend.main:app --host 0.0.0.0 --port 8000 --reload
