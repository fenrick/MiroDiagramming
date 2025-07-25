# Excel Workbook Import & Synchronisation

---

## 0 Purpose

Explain how Excel data is imported into Miro and kept in sync with board
widgets. The guide covers workbook loading, column mapping, template selection
and two-way updates using existing services.

---

## 1 Workbook Loading

Use `ExcelLoader` to parse `.xlsx`/`.xls` files. The loader exposes
`listSheets`, `listNamedTables`, `loadSheet` and `loadNamedTable` helpers for
accessing worksheet rows. The heavy
[exceljs](https://github.com/exceljs/exceljs) library is loaded dynamically from
jsDelivr to keep bundle size small and then converted to objects keyed by column
headers.

```ts
import { excelLoader } from '../core/utils/excel-loader';

const file = /* File from <input type="file"> */;
await excelLoader.loadWorkbook(file);
const rows = excelLoader.loadSheet('Sheet1');
```

### Loading from OneDrive/SharePoint via Microsoft Graph

When workbooks live in OneDrive or SharePoint, use `GraphExcelLoader` to fetch
them through the Microsoft Graph API. Begin by redirecting the user to Azure AD
to acquire an access token. Once authorised you can pass either a share link or
a drive item ID to `loadWorkbookFromGraph`:

```ts
import { graphExcelLoader } from '../core/utils/excel-loader';
import { graphAuth } from '../core/utils/graph-auth';

// handleRedirect() validates the stored OAuth state
graphAuth.handleRedirect();
if (!graphAuth.getToken()) {
  // login() generates an OAuth state value for security
  graphAuth.login('<client id>', ['Files.Read'], window.location.href);
}
await graphExcelLoader.loadWorkbookFromGraph(
  'https://contoso.sharepoint.com/:x:/r/site/doc.xlsx',
);
// alternatively
// await graphExcelLoader.loadWorkbookFromGraph('01B2LJ6UYA6XC7YQO3FBD2I7RBXWJKG6SY');
```

The loader exposes the same helpers as `ExcelLoader` so the remainder of the
workflow is identical.

---

## 2 Column Mapping & Template Selection

Each row is converted into a node or card definition by `mapRowsToNodes` in
`data-mapper.ts`. A `ColumnMapping` object describes which headers supply
identifiers, labels, templates and metadata. Templates are looked up via
`templateManager` and applied directly to the widgets.

```ts
const mapping = {
  idColumn: 'Id',
  labelColumn: 'Title',
  templateColumn: 'Type',
  metadataColumns: { role: 'Role' },
};
```

Select a template column to allow per-row styling or choose a static template
when creating widgets.

---

## 3 Two-Way Sync

`ExcelSyncService` links workbook rows to board widgets using their visible text
content. During import `registerMapping` stores the row identifier alongside the
created widget ID. `updateShapesFromExcel` applies template and text changes
from Excel to existing widgets, while `pushChangesToExcel` reads the widget
content back into the sheet. The service relies on `templateManager` to handle
widget updates.

`RowInspector` surfaces the values of the selected widget's row inside the
sidebar, allowing quick edits. Changes invoke the callback provided by
`ExcelTab` to keep local row data up to date.

### Opening the Edit Metadata Modal

Use the **Edit Metadata** board action to update cell values directly on the
board. Trigger the command from the context menu or press `Ctrl+Alt+M`. The
action opens `app.html?command=edit-metadata`, displaying a modal with the
selected row's fields. After editing, `ExcelSyncService` writes the changes back
to the workbook.

---

## 4 Workflow Summary

1. Load a workbook using `ExcelLoader`.
2. Choose a sheet or named table and map its columns.
3. Pick a template column or fixed template.
4. Create or update widgets on the board.
5. Use `ExcelSyncService` to push modifications back to the workbook.
6. Invoke the **Edit Metadata** board action (`Ctrl+Alt+M`) to edit row data on
   the board.

This approach keeps board content and Excel data synchronised without manual
copy/paste.
