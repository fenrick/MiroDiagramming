# Migration Tracker

This document lists legacy C# controllers and their endpoints to track migration to FastAPI.

| Controller | Endpoints | Status |
|-----------|-----------|--------|
| AuthController | `GET /api/auth/status` | ✅ Migrated |
| BatchController | `POST /api/batch` | ✅ Migrated |
| CacheController | `GET /api/cache/{boardId}` | ✅ Migrated |
| CardsController | `POST /api/cards` | ✅ Migrated |
| LogsController | `POST /api/logs` | ✅ Migrated |
| OAuthController | `GET /oauth/login`, `GET /oauth/callback` | ✅ Migrated |
| ShapesController | `POST /api/boards/{boardId}/shapes`, `DELETE /api/boards/{boardId}/shapes/{itemId}`, `PUT /api/boards/{boardId}/shapes/{itemId}`, `GET /api/boards/{boardId}/shapes/{itemId}` | ✅ Migrated |
| TagsController | `GET /api/boards/{boardId}/tags` | ✅ Migrated |
| UsersController | `POST /api/users` | ✅ Migrated |
| WebhookController | `POST /api/webhook` | ✅ Migrated |
