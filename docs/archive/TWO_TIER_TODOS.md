# Two-Tier Architecture TODOs

This document tracks outstanding tasks needed to optimise the add-on around a thin client and feature-rich **FastAPI** backend.

## Data Model

- [ ] Build a shared DTO layer using **Pydantic** models and generate matching TypeScript types.
- [ ] Persist board state in a **SQLite** database managed via **SQLAlchemy** and expose typed REST endpoints.
- [ ] Research open-source Python clients for the Miro REST API or auto-generate one.

## Queueing and Persistence

- [ ] Extend the Python `ShapeQueueProcessor` with modify/delete queues and durable storage.
- [ ] Persist queue entries in the database and expose an inspection API.
- [ ] Cover queue behaviour with **pytest** integration tests once persistence exists.

## OAuth Flow

- [ ] Implement full OAuth exchange using **Authlib**.
- [ ] Store refreshed tokens via a SQLAlchemy-backed `UserStore`.
- [ ] Add tests for token renewal and failure modes.

## Layout Engine

- [ ] Evaluate Python ports or FFI bindings for the Eclipse Layout Kernel.
- [ ] Keep layout algorithms consistent across tiers.
- [ ] Investigate running the Java-based ELK library via **JPype** or other bridging technologies.

These tasks expand upon the TODO markers found throughout the source.
