# Two-Tier Architecture TODOs

This document tracks outstanding tasks needed to optimise the add-on around a thin client and feature-rich .NET backend.

## Data Model
- [ ] Build a shared DTO layer compiled to both TypeScript and C#.
- [ ] Persist board state in a **PostgreSQL** database managed via **Entity Framework Core** and expose typed REST endpoints.
- [ ] Research open-source .NET clients for the Miro REST API or auto-generate one.

## Queueing and Persistence
- [ ] Extend `ShapeQueueProcessor` with modify/delete queues and durable storage.
- [ ] Persist queue entries in a database and expose an inspection API.
- [ ] Cover queue behaviour with integration tests once persistence exists.

## OAuth Flow
- [ ] Implement full OAuth exchange using `AspNet.Security.OAuth.Miro`.
- [ ] Store refreshed tokens via an ORM-backed `IUserStore`.
- [ ] Add tests for token renewal and failure modes.

## Layout Engine
- [ ] Evaluate .NET ports or cross-compilation of the Eclipse Layout Kernel.
- [ ] Keep layout algorithms consistent across tiers.
- [ ] Investigate **IKVM** as a path to run the Java-based ELK library on .NET.

These tasks expand upon the TODO markers found throughout the source.
