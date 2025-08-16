# Frontend Build

```bash
npm --prefix web/client install
npm --prefix web/client run build
```

The build step generates TypeScript types from the running backend's OpenAPI
schema at `http://localhost:8000/openapi.json`. To regenerate the client types
without building, run:

```bash
npm --prefix web/client run generate-client
```
