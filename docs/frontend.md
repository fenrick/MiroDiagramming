# Frontend Build

```bash
npm install
npm run build
```

The build step generates TypeScript types from the running backend's OpenAPI
schema at `http://localhost:8000/openapi.json`. To regenerate the client types
without building, run:

```bash
npm run generate-client
```
