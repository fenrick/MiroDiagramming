# Architecture Overview

- **Panel stack** – Vite builds a single React panel (`src/app` shell + `src/ui` tabs) that Miro loads via the Web SDK. No server or SSR; everything runs inside the board iframe.
- **Board access** – Helpers in `src/board` and `src/core/utils` wrap `miro.board` for selection cache, shape/tag clients, and future BoardAdapter wiring. All widget mutations flow through these helpers.
- **Layout engines** – ELK (async-loaded) handles layered/nested layouts while Dagre covers lighter graph passes. `src/core/layout` contains the processors plus pre/post transformers.
- **Templates + data** – JSON templates in `/templates` describe shapes, connectors, and cards; importers in `src/board` map incoming JSON to those templates.
- **Logging + telemetry** – `src/logger.ts` writes structured console logs gated by `VITE_LOGFIRE_*`. No external logging pipeline today.
- **Future focus** – formalise a BoardAdapter documented in `docs/WEBSDK_BOARD_ADAPTER.md` and move lingering `globalThis.miro` access behind it.
