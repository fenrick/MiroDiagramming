# Modules Overview

Each section links to the source folder and states its single responsibility. See the code for deeper details; this file tracks the top-level intent only.

## src/app – Panel Shell

- bootstraps React (`app.tsx`) and wraps the sidebar tabs with the design-system shell
- registers with the Miro Web SDK via `diagram-app.ts`

## src/board – Web SDK Helpers

- caches selection and widget lookups (`board-cache.ts`)
- provides processors for templates, cards, frames, search, spacing, etc.
- all functions accept an explicit board parameter to ease testing and future BoardAdapter adoption

## src/core – Shared Logic

- layout engines (ELK, Dagre, nested processors) live under `core/layout`
- shared utilities/hooks (`core/utils`, `core/hooks`) support importers and UI tabs
- mermaid conversion/rendering is centralised here for reuse

## src/ui – Tabs & Components

- reusable building blocks under `ui/components` (Button, SidebarSection, Callouts, etc.)
- tab implementations under `ui/pages`, each exporting a `tabDefinition`
- hooks under `ui/hooks` isolate panel behaviors (search, notifications, etc.)

## templates/ – Shape & Card Definitions

- JSON manifests define shapes, connectors, and cards used by the importers
- editing templates does not require rebuilding code; reload the app to pick up changes
