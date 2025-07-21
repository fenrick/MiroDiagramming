# Server Module Reference

---

## 0 Purpose

Outline the planned .NET 9 server layout that complements the existing React
client. The server exposes REST endpoints and a webhook listener, caches board
ids and acts as the authoritative API entry point. This document defines the
project structure and main controllers.

## 1 Proposed Repository Layout

```
fenrick.miro.server/
  src/                .NET 9 API project
    Api/              controllers and middleware
    Domain/           entities and data models
    Services/         business logic and caching
  fenrick.miro.server.csproj  project file
fenrick.miro.client/
  src/                React client
    app/              entry and routing
    board/            board adapter utilities
    core/             domain logic used by the client
    ui/               React components
fenrick.miro.tests/   unit tests for .NET code
fenrick.miro.client/tests/       Node tests
```

All server modules live under `fenrick.miro.server/src/` with matching tests
under `fenrick.miro.tests/`. The Node code resides in
`fenrick.miro.client/src/` to emphasise the front‑end role.

## 2 IDE Configuration

- `fenrick.miro.server/fenrick.miro.server.csproj` – .NET 9 Web API project.
- `package.json` in `fenrick.miro.client/` – Node workspace for the React client.

Each tool can open only its relevant folder, but the repository still builds end
to end using the shared `npm` and `dotnet` commands.

## 3 Controllers

The API exposes four controller types:

1. **BatchController** – accepts an array of REST requests and forwards them to
   the Miro API using a single authenticated client. Responses are returned in
   the original order.
2. **WebhookController** – handles Miro board webhooks. Each event is validated
   and queued for processing so the webhook endpoint stays lightweight.
3. **CacheController** – returns board ids and other metadata stored in the
   server cache. This minimises round trips when rendering existing diagrams.
4. **LogsController** – accepts client log entries and writes them to the server
   log via Serilog.
5. **ShapesController** – creates, updates and deletes widgets via the Miro API.
   Each operation updates `IShapeCache` so the front‑end can fetch shapes
   without calling `board.get`. TODO: expose a lookup endpoint once the cache
   supports persistence.

Each controller resides under `fenrick.miro.server/src/Api/` and is covered by
dedicated unit tests.

## 4 Shared Contracts

Models used by both the server and client live in
`fenrick.miro.server/src/Domain/`. These include board metadata, webhook
payloads and diagram definitions. The React code imports the TypeScript
declarations generated from the C# records, ensuring a single source of truth
for all data shapes.

---

See **ARCHITECTURE.md** for the overall system overview and code quality
requirements.
