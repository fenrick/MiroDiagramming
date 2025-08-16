# FastAPI Quick Start

The previous .NET Aspire guide now lives in [legacy/dotnet/docs/ASPIRE.md](../legacy/dotnet/docs/ASPIRE.md).

This guide shows how to run the Python FastAPI service for local development.

## 1. Install dependencies

```bash
poetry install
```

## 2. Run the service

```bash
poetry run uvicorn src.main:app --reload
```

See [python-architecture.md](python-architecture.md) for architecture details.
