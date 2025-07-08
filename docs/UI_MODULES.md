# UI Module Reference

---

## 0 Purpose

This document describes the React-based UI modules under `src/ui/`. Components,
hooks and pages form the add-on interface.

## 1 Directory Overview

```
src/ui/
  components/
    EditMetadataModal.tsx
    JsonDropZone.tsx
    Modal.tsx
    RowInspector.tsx
    SegmentedControl.tsx
    TabBar.tsx
  hooks/
    excel-data-context.tsx
    notifications.ts
    ui-utils.ts
    use-diagram-create.ts
    use-excel-handlers.ts
    use-excel-sync.ts
    use-row-data.ts
    use-search-handlers.ts
    use-selection.ts
  pages/
    ArrangeTab.tsx
    CardsTab.tsx
    DiagramsTab.tsx
    StructuredTab.tsx
    LayoutEngineTab.tsx
    DummyTab.tsx
    ExcelTab.tsx
    FramesTab.tsx
    HelpTab.tsx
    ResizeTab.tsx
    SearchTab.tsx
    StyleTab.tsx
    tab-definitions.ts
    tabs.ts
  style-presets.ts
  design tokens (from @mirohq/design-tokens)
```

## 2 Module Purpose

| File / Folder                    | Purpose                                                |
| -------------------------------- | ------------------------------------------------------ |
| components/                      | Reusable UI building blocks and wrapper elements.      |
| components/EditMetadataModal.tsx | Modal for editing board item metadata.                 |
| components/JsonDropZone.tsx      | Drag-and-drop zone for JSON files.                     |
| components/Modal.tsx             | Generic dialog component.                              |
| components/RowInspector.tsx      | Displays row details in side panel.                    |
| components/SegmentedControl.tsx  | Simple segmented switch for small options.             |
| components/TabBar.tsx            | Horizontal list of available tabs.                     |
| hooks/                           | React hooks for state management and board operations. |
| pages/                           | Individual tabs rendered inside the panel.             |
| style-presets.ts                 | Named style collections for widgets.                   |
| design tokens                    | Design tokens consumed by components.                  |
| pages/tabs.ts                    | Tab registration and ordering.                         |
| pages/tab-definitions.ts         | Mapping of tab identifiers to components.              |
