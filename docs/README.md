# Documentation Guide

This repository keeps topical docs in `docs/` so contributors can deep-dive only when needed. Start here to find the right reference quickly.

## Guidelines

| Doc                                                                   | Purpose                                  |
| --------------------------------------------------------------------- | ---------------------------------------- |
| [DOCUMENTATION_GUIDELINES.md](guidelines/DOCUMENTATION_GUIDELINES.md) | Scope/format expectations for every doc. |
| [IMPLEMENTATION_PLAN.md](../implementation_plan.md)                   | Living backlog of improvements.          |

## Architecture

| Doc                                              | Purpose                                                       |
| ------------------------------------------------ | ------------------------------------------------------------- |
| [ARCHITECTURE.md](architecture/ARCHITECTURE.md)  | Current frontend/Web SDK architecture.                        |
| [NODE_ARCHITECTURE.md](NODE_ARCHITECTURE.md)     | Remaining notes from the backend retirement (reference only). |
| [MIGRATION_NODE_PLAN.md](MIGRATION_NODE_PLAN.md) | Cleanup items that still need to happen post-backend.         |
| [LAYOUT_OPTIONS.md](LAYOUT_OPTIONS.md)           | Available ELK/Dagre/Nested layout settings.                   |

## Modules & Data

| Doc                                    | Purpose                                                                              |
| -------------------------------------- | ------------------------------------------------------------------------------------ |
| [MODULES.md](modules/MODULES.md)       | Single-page overview of `src/app`, `src/board`, `src/core`, `src/ui`, and templates. |
| [TEMPLATES.md](TEMPLATES.md)           | Shape, connector, and card template schema with examples.                            |
| [MIRO_API_COSTS.md](MIRO_API_COSTS.md) | Cost-based rationale for caching and batch operations.                               |

## UX & UI

| Doc                           | Purpose                                                       |
| ----------------------------- | ------------------------------------------------------------- |
| [UX_GUIDE.md](ux/UX_GUIDE.md) | Design-system usage, spacing, and accessibility expectations. |
| [TABS.md](TABS.md)            | Behavior summary for each sidebar tab.                        |

## Operations

| Doc                                                | Purpose                                                    |
| -------------------------------------------------- | ---------------------------------------------------------- |
| [OPERATIONS.md](operations/OPERATIONS.md)          | Build, deploy, monitor, and rollback steps.                |
| [FRONTEND.md](FRONTEND.md)                         | Miro manifest setup + local dev checklist.                 |
| [CODE_STYLE.md](CODE_STYLE.md)                     | ESLint, formatting, and naming conventions enforced in CI. |
| [WEBSDK_BOARD_ADAPTER.md](WEBSDK_BOARD_ADAPTER.md) | Planned adapter surface for Web SDK access.                |

## Historical / Archived

Legacy documents that predate the current structure remain under [archive/](archive/). Keep them for troubleshooting only—new work should live in the folders above.

> Naming: documents use uppercase file names with underscores (e.g., `CODE_STYLE.md`). If you touch a legacy file, rename it to match.

Whenever you add or retire a guide, update this index and note the change in `implementation_plan.md` if it affects roadmap work.
