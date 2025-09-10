# Python Architecture

## Module Overview

```text
+------------------+       +-----------+       +----------------+
| FastAPI Routers  +------>+ Services  +------>+ Repositories   |
+------------------+       +-----------+       +----------------+
                                                     |
                                                     v
                                             +---------------+
                                             | SQLite Cache  |
                                             +---------------+
                                                     |
                                                     v
                                             +---------------+
                                             |   Miro API    |
                                             +---------------+

                +---------------------+
                |   Queue Worker      |
                | (background tasks)  |
                +---------------------+
```

## Request Flow

1. Node client issues HTTP request.
2. FastAPI router validates input and delegates to a service.
3. Service coordinates domain logic and queries the repository.
4. Repository reads from the SQLite cache; on a miss it fetches from the Miro API and updates the cache.
5. Service returns DTOs to the router, which serialises the response back to the client.

## API Endpoints

- `GET /api/auth/status` – verify that OAuth tokens exist for the supplied `X-User-Id`.
- `POST /api/batch` – enqueue a batch of board operations for asynchronous processing.
- `GET /api/cache/{boardId}` – return the cached state for a board.
- `POST /api/cards` – queue creation of multiple cards.
- `POST /api/logs` – ingest client log entries for diagnostics.
- `GET /oauth/login` / `GET /oauth/callback` – complete the OAuth handshake and persist tokens.
- `GET /api/boards/{boardId}/shapes/{itemId}` – retrieve a shape owned by the caller.
- `POST /api/boards/{boardId}/shapes` – create a new shape on a board.
- `PUT /api/boards/{boardId}/shapes/{itemId}` – update an existing shape.
- `DELETE /api/boards/{boardId}/shapes/{itemId}` – delete a shape.
- `GET /api/boards/{boardId}/tags` – list all tags for a board.
- `POST /api/users` – persist user tokens and metadata.
- `POST /api/webhook` – accept webhook events from Miro for background processing.

## User Store

- An in-memory, thread-safe store keeps OAuth tokens keyed by user ID. It acts as a
  temporary solution until a persistent repository is implemented.

## Background Queue

- Routers or services enqueue long-running jobs (e.g. board sync or webhook processing).
- A dedicated worker consumes the queue, reusing the same services and repositories as the web layer.
- Failures are retried with exponential backoff and logged with full context.
- Pending tasks are persisted to SQLite so they survive process restarts.
- On startup the queue reloads any stored tasks before accepting new work.

## Static Assets and CORS

- `StaticFiles` serves bundled client assets. Paths are versioned to enable aggressive caching.
- CORS is restricted to the official Node client origin and only exposes the required headers.

## Error Handling & Logging

- Use exception handlers to map domain and validation errors into clear HTTP responses.
- Structured logging captures correlation IDs and request context. Logging output ships to the central aggregator and feeds metri
  cs/alerts.
- A global fallback handler reports unhandled exceptions and returns a 500 response without leaking internals.

## Observability

- Prometheus scrapes `GET /metrics` for request counters and latency histograms.
- Traces are exported via OpenTelemetry using either OTLP or Jaeger exporters.
- Configure collector endpoints with the following environment variables:
    - `OTEL_EXPORTER_OTLP_ENDPOINT` – HTTP endpoint for an OTLP collector.
    - `JAEGER_AGENT_HOST` / `JAEGER_AGENT_PORT` – Jaeger agent host and port.
- Metrics, logs and traces share the same request ID for cohesive diagnostics through Logfire.

## Security

- Enforce HTTPS and HSTS at the edge.
- Secrets (API keys, database credentials) are injected via environment variables or secret managers; they are never committed to source control.
- Input is validated and sanitised to avoid injection attacks.
- Access to the Miro API uses short-lived OAuth tokens that are rotated and stored outside the codebase.

## Migration Strategy

- Initial Python endpoints may proxy requests to existing C# services when feature parity is incomplete.
- Each migration phase replaces a legacy C# feature with a Python implementation and gradually deprecates the proxy.

## Coding Standards

- Follow [PEP 8](https://peps.python.org/pep-0008/) with automatic formatting (e.g. `black`).
- Provide concise docstrings and type hints for all public APIs.
- Maintain small, single-responsibility modules and refactor shared logic into common libraries.
- Run `pre-commit` hooks for formatting and linting (`black`, `ruff`) and enforce tests (`pytest`) in continuous integration.
