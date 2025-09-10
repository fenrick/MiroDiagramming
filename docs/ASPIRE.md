# FastAPI Quick Start

The previous .NET Aspire guide now lives in [legacy/dotnet/docs/ASPIRE.md](../legacy/dotnet/docs/ASPIRE.md).

This guide shows how to run the Python FastAPI service for local development.

## 1. Install dependencies

```bash
poetry install
```

## 2. Run the service

Option A — helper script (recommended):

```bash
scripts/start-backend.sh         # builds UI and starts http://localhost:8000
# To skip building the UI: SKIP_FRONTEND_BUILD=true scripts/start-backend.sh
```

Option B — direct Uvicorn:

```bash
poetry run uvicorn src.miro_backend.main:app --reload --port 8000
```

Dev both backend + frontend:

```bash
scripts/dev.sh                   # backend on :8000, Vite on :5173
```

Prerequisites

- Python 3.11+ (use pyenv or your system Python).
- Poetry (https://python-poetry.org/docs/#installation)
- Node 20.x for building the UI (skip with SKIP_FRONTEND_BUILD=true if not available).

See [python-architecture.md](python-architecture.md) for architecture details.
