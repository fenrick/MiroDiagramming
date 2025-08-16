# Miro API Costs & Caching Strategy

_Version 2025-07-21_

---

## 0 Purpose

Explain our design decisions regarding the high point cost of some Miro REST API calls. Caching shapes and moving widget manipulation to the server minimises these costs.

## 1 Cost Summary

The following endpoints each cost **500** points per call:

| Endpoint             | Description                   |
| -------------------- | ----------------------------- |
| `board.get`          | Fetch all widgets of a board. |
| `item`               | Retrieve a single widget.     |
| `item.setmetadata`   | Update widget metadata.       |
| `board.getselection` | Retrieve the user selection.  |

Excessive use quickly exhausts the daily rate limit.

## 2 Design Decisions

1. **Server‑side shape management** – Widget creation, update and deletion are handled by the **FastAPI Shapes router**. The client calls `/api/boards/{boardId}/shapes` via `ShapeClient`.
2. **In‑memory shape cache** – `ShapeCache` stores widgets by board and item identifier. The FastAPI Shapes router updates the cache after each change so lookups avoid `board.get` or `item` requests.
3. **Planned persistent cache** – future versions will back the cache with Redis and **SQLite** via **SQLAlchemy** so multiple server instances share widget data.
4. **Centralised logging** – `HttpLogSink` forwards front‑end log entries to the server so shape operations are traceable across the boundary.
5. **Avoid direct board calls** – Front‑end modules now contain TODOs to replace remaining direct Web SDK calls (`board.getSelection`, `board.get`) with cached lookups.
6. **Expanded REST coverage** – placeholder shim methods will wrap additional Miro endpoints so future features can reuse a consistent API layer.

This approach reduces point expenditure and keeps the application responsive.

## 3 Remaining Work

The caching layer currently lives purely in memory. Persisted storage and
automatic invalidation are future enhancements. Client modules such as
`card-processor.ts` and `excel-sync-service.ts` still invoke `board.get` and
`getById`; TODO comments mark these spots until the backend lookup API is fully
integrated.
