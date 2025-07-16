# Server Module Reference

---

## 0 Purpose

Outline the planned .NET 9 server layout that complements the existing React
client. The server exposes REST endpoints and a webhook listener, caches board
ids and acts as the authoritative API entry point. This document defines the
project structure and main controllers.

## 1 Proposed Repository Layout

```
src/
  server/              .NET 9 API project
    Api/               controllers and middleware
    Domain/            entities and data models
    Services/          business logic and caching
    Server.csproj      project file
  ux/                  existing Node/React client
    app/               entry and routing
    board/             board adapter utilities
    core/              domain logic used by the client
    ui/                React components
  tests/
    server/            unit tests for .NET code
    ux/                existing Node tests
```

All server modules live under `src/server/` with matching tests under
`tests/server/`. The Node code migrates into `src/ux/` to emphasise the
front‑end role.

## 2 IDE Configuration

Two project files allow easy loading in either VS Code or JetBrains Rider:

- `src/server/Server.csproj` – .NET 9 Web API project.
- `package.json` in `src/ux/` – Node workspace for the React client.

Each tool can open only its relevant folder, but the repository still builds end
to end using the shared `npm` and `dotnet` commands.

## 3 Controllers

The API exposes three controller types:

1. **BatchController** – accepts an array of REST requests and forwards them to
   the Miro API using a single authenticated client. Responses are returned in
   the original order.
2. **WebhookController** – handles Miro board webhooks. Each event is validated
   and queued for processing so the webhook endpoint stays lightweight.
3. **CacheController** – returns board ids and other metadata stored in the
   server cache. This minimises round trips when rendering existing diagrams.

Each controller resides under `src/server/Api/` and is covered by dedicated unit
tests.

## 4 Shared Contracts

Models used by both the server and client live in `src/server/Domain/`. These
include board metadata, webhook payloads and diagram definitions. The React code
imports the TypeScript declarations generated from the C# records, ensuring a
single source of truth for all data shapes.

---

See **ARCHITECTURE.md** for the overall system overview and code quality
requirements.
