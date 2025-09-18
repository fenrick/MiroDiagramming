# Core Module Reference

---

## 0 Purpose

This document summarises TypeScript modules under `src/core/`.
It complements the repository map in `ARCHITECTURE.md` and explains the
responsibility of each file.

## 1 Directory Overview

```
src/core/
  data-mapper.ts
  excel-sync-service.ts
  graph/
    convert.ts
    graph-processor.ts
    graph-service.ts
    hierarchy-processor.ts
    index.ts
    layout-modes.ts
    undoable-processor.ts
  layout/
    elk-layout.ts
    elk-loader.ts
    elk-options.ts
    layout-core.ts
    layout-utils.ts
    nested-layout.ts
  utils/
    aspect-ratio.ts
    base64.ts
    cards.ts
    color-utils.ts
    excel-loader.ts
    file-utils.ts
    tag-client.ts
    text-utils.ts
    unit-utils.ts
    workbook-writer.ts
```

## 2 Module Purpose

| File                         | Purpose                                             |
| ---------------------------- | --------------------------------------------------- |
| data-mapper.ts               | Map spreadsheet rows to node or card objects.       |
| excel-sync-service.ts        | Synchronise workbook data with board widgets.       |
| graph/convert.ts             | Convert between flat graphs and hierarchical trees. |
| graph/graph-processor.ts     | Orchestrate graph import, layout and rendering.     |
| graph/graph-service.ts       | Provide graph CRUD operations for the UI.           |
| graph/hierarchy-processor.ts | Manipulate tree structures for nested layouts.      |
| graph/index.ts               | Bundle graph utilities for external use.            |
| graph/layout-modes.ts        | Enumerate supported layout algorithms.              |
| graph/undoable-processor.ts  | Base class adding undo support to processors.       |
| layout/elk-layout.ts         | Run layout calculations using the ELK engine.       |
| layout/elk-loader.ts         | Lazy-load the ELK WebAssembly bundle.               |
| layout/elk-options.ts        | Provide user options for ELK layout algorithms.     |
| layout/layout-core.ts        | Shared functions for running graph layouts.         |
| layout/layout-utils.ts       | Utility helpers for layout calculations.            |
| layout/nested-layout.ts      | Arrange nodes in a nested hierarchy.                |
| utils/aspect-ratio.ts        | Maintain consistent aspect ratios when scaling.     |
| utils/base64.ts              | Encode data in Base64 without regex backtracking.   |
| utils/cards.ts               | Format card content for widgets.                    |
| utils/color-utils.ts         | Map semantic color names to Miro tokens.            |
| utils/exceljs-loader.ts      | Dynamically load ExcelJS from the CDN.              |
| utils/excel-loader.ts        | Parse Excel files into row objects.                 |
| utils/file-utils.ts          | Read and write local files for import/export.       |
| utils/tag-client.ts          | Minimal client for board tag operations.            |
| utils/text-utils.ts          | Read and write widget text content.                 |
| utils/unit-utils.ts          | Unit conversion helpers for board measurements.     |
| utils/workbook-writer.ts     | Output workbook rows to an Excel file.              |
