# Board Module Reference

---

## 0 Purpose

This document summarises the individual TypeScript modules located under
`fenrick.miro.client/src/board/`. It complements the repository map in
`ARCHITECTURE.md` and clarifies what each file is responsible for.

## 1 Directory Overview

```
fenrick.miro.client/src/board/
```

- board-builder.ts
- board.ts
- card-processor.ts
- connector-utils.ts
- element-utils.ts
- format-tools.ts
- frame-tools.ts
- frame-utils.ts
- grid-layout.ts
- grid-tools.ts
- item-types.ts
- meta-constants.ts
- node-search.ts
- resize-tools.ts
- search-tools.ts
- spacing-layout.ts
- spacing-tools.ts
- style-tools.ts
- templates.ts
- undo-utils.ts

## 2 Module Purpose

| File               | Purpose                                                      |
| ------------------ | ------------------------------------------------------------ |
| board.ts           | Board API helpers and simple abstractions used across tools. |
| board-builder.ts   | Creates and updates widgets on the board.                    |
| card-processor.ts  | Imports card data and arranges them in a grid.               |
| connector-utils.ts | Connector creation and update helpers.                       |
| element-utils.ts   | Shared widget helper functions.                              |
| format-tools.ts    | Text and date formatting utilities.                          |
| frame-tools.ts     | Operations for renaming and editing frames.                  |
| frame-utils.ts     | Locate or register frames on the board.                      |
| grid-layout.ts     | Pure functions computing grid positions.                     |
| grid-tools.ts      | Applies grid layouts to the current selection.               |
| item-types.ts      | Type guards for different widget kinds.                      |
| meta-constants.ts  | Metadata key definitions used across modules.                |
| node-search.ts     | Board search functions for nodes and groups.                 |
| resize-tools.ts    | Resize selected widgets to match references.                 |
| search-tools.ts    | Text search helpers for selection and boards.                |
| spacing-layout.ts  | Pure spacing calculations for growth or movement.            |
| spacing-tools.ts   | Spreads widgets by moving or growing them.                   |
| style-tools.ts     | Apply predefined styles to widgets.                          |
| templates.ts       | Widget template management and rendering.                    |
| undo-utils.ts      | Undo helpers for board actions.                              |
