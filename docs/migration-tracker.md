# Migration Tracker

This document lists legacy C# controllers and their endpoints to track migration to FastAPI.

| Controller | Endpoints | Status |
|-----------|-----------|--------|
| AuthController | `GET /api/auth/status` | ✅ Migrated |
| BatchController | `POST /api/batch` | ⏳ Pending |
| CacheController | `GET /api/cache/{boardId}` | ⏳ Pending |
| CardsController | `POST /api/cards` | ⏳ Pending |
| LogsController | `POST /api/logs` | ⏳ Pending |
| OAuthController | `GET /oauth/login`, `GET /oauth/callback` | ⏳ Pending |
| ShapesController | `POST /api/boards/{boardId}/shapes`, `DELETE /api/boards/{boardId}/shapes/{itemId}`, `PUT /api/boards/{boardId}/shapes/{itemId}`, `GET /api/boards/{boardId}/shapes/{itemId}` | ⏳ Pending |
| TagsController | `GET /api/boards/{boardId}/tags` | ⏳ Pending |
| UsersController | `POST /api/users` | ⏳ Pending |
| WebhookController | `POST /api/webhook` | ⏳ Pending |
