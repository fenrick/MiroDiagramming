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

## Background Queue

- Routers or services enqueue long-running jobs (e.g. board sync or webhook processing).
- A dedicated worker consumes the queue, reusing the same services and repositories as the web layer.
- Failures are retried with exponential backoff and logged with full context.

## Static Assets and CORS

- `StaticFiles` serves bundled client assets. Paths are versioned to enable aggressive caching.
- CORS is restricted to the official Node client origin and only exposes the required headers.

## Error Handling & Logging

- Use exception handlers to map domain and validation errors into clear HTTP responses.
- Structured logging captures correlation IDs and request context. Logging output ships to the central aggregator and feeds metri
cs/alerts.
- A global fallback handler reports unhandled exceptions and returns a 500 response without leaking internals.

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

