# Miro API Costs & Caching Strategy

_Version 2025-07-21_

---

## 0 Purpose

Explain our design decisions regarding the high point cost of some Miro REST API calls. Caching shapes and moving widget manipulation to the server minimises these costs.

## 1 Cost Summary

The following endpoints each cost **500** points per call:

| Endpoint | Description |
| -------- | ----------- |
| `board.get` | Fetch all widgets of a board. |
| `item` | Retrieve a single widget. |
| `item.setmetadata` | Update widget metadata. |
| `board.getselection` | Retrieve the user selection. |

Excessive use quickly exhausts the daily rate limit.

## 2 Design Decisions

1. **Server‑side shape management** – Widget creation, update and deletion are performed by `ShapesController` in the .NET server. The client calls `/api/boards/{boardId}/shapes` via `ShapeClient`.
2. **In‑memory shape cache** – `IShapeCache` stores widgets by board and item identifier. Controllers update the cache after every change so lookups avoid `board.get` or `item` requests.
3. **Centralised logging** – `HttpLogSink` forwards front‑end log entries to the server so shape operations are traceable across the boundary.
4. **Avoid direct board calls** – Front‑end modules now contain TODOs to replace remaining direct Web SDK calls (`board.getSelection`, `board.get`) with cached lookups.

This approach reduces point expenditure and keeps the application responsive.
