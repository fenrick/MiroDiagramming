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

The API exposes five controller types:

1. **BatchController** – accepts an array of REST requests and forwards them to
   the Miro API using a single authenticated client. Responses are returned in
   the original order.
2. **WebhookController** – handles Miro board webhooks. Each event is validated
   and queued for processing so the webhook endpoint stays lightweight.
3. **CacheController** – returns board ids and other metadata stored in the
   server cache. This minimises round trips when rendering existing diagrams.
4. **LogsController** – accepts client log entries and writes them to the server
   log via Serilog.
5. **UsersController** – stores OAuth tokens received from the client.
6. **ShapesController** – creates, updates and deletes widgets via the Miro API.
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

## 5 Services

Supporting classes under `src/Services/` provide infrastructure glue:

- **InMemoryUserStore** – temporary storage for user tokens during development.
- **MiroRestClient** – HTTP adapter attaching bearer tokens to requests.

---

See **ARCHITECTURE.md** for the overall system overview and code quality
requirements.

## 5 Future Work

The initial services intentionally keep the scope small. The following features remain TODO and are marked throughout the source:

- **ELK-based LayoutEngine** – port the heavy shape placement algorithms from the JavaScript codebase. The current `LayoutEngine` only stacks nodes vertically.
- **Persistent shape cache** – back `IShapeCache` with Redis and a **PostgreSQL** store managed by **Entity Framework Core**, then expose a lookup endpoint.
- **Background queue management** – handle modify and delete operations with priority over new creations.
  - **Queue persistence** – store pending shape operations in **PostgreSQL** using Entity Framework Core and integrate with a durable queue.
- **Token refresh endpoint** – automatically renew expired tokens and store updates securely.
- **REST client library** – investigate community or official .NET wrappers for the Miro REST API to avoid bespoke HTTP code.
- **Full OAuth flow** – research `AspNet.Security.OAuth.Miro` and implement the server-side exchange.
- **ExcelLoader extensions** – add streaming support, large workbook optimisation and named table handling.
  - **Template persistence** – store user templates in **PostgreSQL** via Entity Framework Core and expose API endpoints for editing and listing templates.
- **Advanced object matching** – provide fuzzy search and shape property filters beyond simple label comparison.
- **Comprehensive tests** – ensure every endpoint reaches ≥ 90 % coverage with unit and integration tests.

These enhancements will gradually replace the lightweight placeholders.
