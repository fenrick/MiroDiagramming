# Web Client

## Development

- Backend URL: set `VITE_BACKEND_URL` or leave empty to use Vite proxy.
- Dev OAuth: Vite proxies `/oauth/*` to the backend.

## Generated Types

Regenerate TypeScript interfaces from backend Pydantic models:

```bash
poetry run python scripts/gen_user_info_ts.py
```

The output is written to `src/generated/`.
