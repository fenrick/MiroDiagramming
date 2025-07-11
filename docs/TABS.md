# Sidebar Tabs — Detailed Functional Blueprint

_Explicit UI + interaction walkthrough for every tab (June 2025)_

This document narrows focus to the **ten sidebar tabs** in the
Structured Diagramming add‑on. Each tab section specifies panel layout, visible
controls, states, interaction flows, tool‑tips, keyboard shortcuts, and
validation rules—so any developer can translate designs into code with zero
ambiguity.

---

## Legend

- **UI Element** – Visual component to render (exact Mirotone component/class).
- **Copy (EN‑AU)** – Literal text shown to users.
- **Interaction Flow** – Ordered user actions → system responses.
- **State Store** – Redux slice / React context field.
- **Shortcut** – Keyboard binding (Mac / Win).

---

## 1  Diagrams Tab

| Step | UI Element         | Copy (EN‑AU)                           | Interaction Flow                               | State Store   |
| ---- | ------------------ | -------------------------------------- | ---------------------------------------------- | ------------- |
| 1    | `<TabBar>` sub-nav | “Structured”, “Cards”, “Layout Engine” | Choose sub-tab                                 | `createMode`  |
| 2    | `<DropZone>` area  | "Drag a .json file"                    | Drag file → highlight border; on drop validate | `importQueue` |
| 3    | Structured options | as per old Diagram tab                 | Layout settings + build button                 | –             |
| 4    | Cards options      | as per old Cards tab                   | Search, tag filter and create button           | –             |
| 5    | Layout Engine      | Placeholder text                       | Coming soon                                    | –             |

**Tooltip for invalid row** – "Edge refers to missing node '‘%id%’.'" Shortcut:
**⌘/** toggles the **Advanced options** accordion on the Diagram tab.

---

## 2  Tools Tab

Combines resizing, style tweaks, arranging widgets and frame utilities. Tabs
within this section mirror the previous individual tabs.

### 2.1 Resize

As per the former **Resize Tab** with width/height inputs, aspect ratio and copy
functions.

### 2.2 Colours

Brightness slider and preset buttons from the old **Style Tab**.

### 2.3 Arrange

Grid and spacing controls previously found in the **Arrange Tab**.

### 2.4 Frames

Prefix rename and locking options from the old **Frames Tab**.

---

## 6  Templates Tab

Two‑pane Flex (`SidebarList` categories + `MasonryGrid` templates).

| Category List Item | Copy                         | Keyboard Nav                   |
| ------------------ | ---------------------------- | ------------------------------ |
| List button        | “Flowcharts”, “AWS”, “BPMN”… | Up/Down to move; Enter selects |

Template Card shows:

- Thumbnail 160×100
- Node count badge
- “Insert” button

Insert Flow: click → loads JSON → `GraphProcessor` → `BoardBuilder.sync` → opens
Rename modal.

---

## 7  Export Tab

| Export Type            | Fields                                                      | Default Values      |
| ---------------------- | ----------------------------------------------------------- | ------------------- |
| **PNG**                | Resolution dropdown (1×/2×), Background: Transparent toggle | 1×, Transparent OFF |
| **SVG**                | Include Comments checkbox                                   | OFF                 |
| **BPMN XML**           | Version dropdown (2.0/2.1)                                  | 2.0                 |
| **Markdown (Mermaid)** | Copy to clipboard only                                      | –                   |

Progress Bar: shows %; disable sidebar during export.

Error: if PNG > 16 k × 16 k px → show modal “Canvas too large; zoom or frame to
export.”

---

## 8  Data Tab (Live Bindings)

Wizard (Stepper):

1. **Select Source** – REST / CSV / WebSocket; URL/file input.
2. **Test Connection** – Ping and show latency badge (green < 200 ms, yellow
   < 500 ms, red otherwise).
3. **Field Mapping** – Drag API fields → node properties list.
4. **Activation** – Toggle “Live Update”; snackbar shows success.

Polling interval slider (2 – 300 s). State `dataBindings[{boardId}]`.

---

## 9  Comment Tab

- **Thread List** – Sidebar list grouped by widget.
- **Editor** – RichTextInput supports `@mention`; autocomplete list uses
  `miro.board.getUsers()`.
- **Resolve Toggle** – Checkbox; resolved threads greyed out, filtered when view
  = “Unresolved”.
- **Filter Tabs** – All / Mine / Unresolved (Tertiary buttons).

Shortcut: **Shift +C** opens comment editor on current selection.

---

## 10  Search Tab

| Control                     | Details                             |
| --------------------------- | ----------------------------------- |
| **Find Input**              | Text to locate on the board         |
| **Replace Input**           | Replacement text applied in bulk    |
| **Case Sensitive Checkbox** | Match exact letter case             |
| **Whole Word Checkbox**     | Skip partial-word matches           |
| **Regex Checkbox**          | Treat query as regular expression   |
| **Widget Type Checkboxes**  | Filter results by widget type       |
| **Tag IDs Input**           | Comma separated tags to match       |
| **Background Colour Input** | Exact fill colour filter            |
| **Assignee ID Input**       | Filter by assigned user             |
| **Creator ID Input**        | Filter by creator                   |
| **Last Modified By Input**  | Filter by last modifier             |
| **Next Button**             | Scrolls board to next match         |
| **Replace Button**          | Replace the highlighted match only  |
| **Replace All**             | Calls `replaceBoardContent` utility |

Flow: typing in the **Find** field debounces `searchBoardContent` by 300 ms and
updates the match count. The **Next** button cycles through results and zooms
the board to each widget. **Replace** updates just the current item via
`replaceBoardContent` with `inSelection` pointing to that widget.

---

## Global Keyboard Shortcuts

| Action       | Mac | Win/Linux |
| ------------ | --- | --------- |
| Undo         | ⌘Z  | CtrlZ     |
| Redo         | ⌘⇧Z | Ctrl⇧Z    |
| Copy Size    | ⌥C  | AltC      |
| Apply Size   | ⌥V  | AltV      |
| Open Comment | ⇧C  | ShiftC    |

---

## Board Actions

| Action        | Location                    | Result                                                |
| ------------- | --------------------------- | ----------------------------------------------------- |
| Edit Metadata | Context menu or app command | Opens the Edit Metadata modal for the selected widget |

---

## Validation & Error Summary

1. **File type** – Only .json/.csv/.mmd accepted; else toast “Unsupported file
   type”.
2. **Graph cycles** – Detect self‑loops; prompt “Cannot layout self‑loop. Break
   edge?”
3. **Selection empty** – Tabs with selection‑based actions show banner: “Select
   items to enable controls.”
4. **Network fail (Data Tab)** – Red status badge, retry logic 3× exponential
   backoff.

---

## State Diagram

```mermaid
stateDiagram
  [*] --> Idle
  Idle --> Importing : Drag file
  Importing --> Validating
  Validating --> Ready : All rows valid
  Ready --> Building : Click Build
  Building --> Success : Widgets created
  Building --> Error : SDK fail
  Error --> Idle : Dismiss
  Success --> Idle : Toast timeout
```

---

_Keep this blueprint adjacent to the codebase; update whenever controls or flows
change._
