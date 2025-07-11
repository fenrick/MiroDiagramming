import React from 'react';
import type { ExcelRow } from '../../core/utils/excel-loader';
import { useSelection } from './use-selection';
import type { BaseItem, Group } from '@mirohq/websdk-types';

const META_KEY = 'app.miro.excel';

/**
 * Narrow a board item to the Group type.
 *
 * @param item - Widget or group from the Miro SDK.
 * @returns True when the item exposes a `getItems` method.
 */
function isGroup(item: BaseItem | Group): item is Group {
  return typeof (item as Group).getItems === 'function';
}

/**
 * Safely read the `rowId` property from arbitrary metadata.
 *
 * @param meta - Metadata value retrieved from a board item.
 * @returns The row identifier as a string or `undefined`.
 */
function parseRowId(meta: unknown): string | undefined {
  if (meta && typeof meta === 'object' && 'rowId' in meta) {
    const value = (meta as { rowId?: unknown }).rowId;
    return value != null ? String(value) : undefined;
  }
  return undefined;
}

/**
 * Extract the row identifier from a widget or group.
 *
 * The function checks metadata on the item itself or each child of a group
 * for a `rowId` property.
 */
async function extractRowId(
  item: BaseItem | Group,
): Promise<string | undefined> {
  if (isGroup(item)) {
    const items = await item.getItems();
    for (const child of items) {
      const meta = await child.getMetadata(META_KEY);
      const rowId = parseRowId(meta);
      if (rowId) return rowId;
    }
    /* c8 ignore next */
    return undefined;
  }
  const meta = await item.getMetadata(META_KEY);
  return parseRowId(meta);
}

/**
 * Locate an Excel row matching the provided identifier.
 */
function findRow(
  rows: ExcelRow[],
  idColumn: string | undefined,
  id: string,
): ExcelRow | null {
  if (idColumn) {
    return rows.find((r) => String(r[idColumn]) === id) ?? null;
  }
  const idx = Number(id);
  return Number.isFinite(idx) ? (rows[idx] ?? null) : null;
}

/**
 * React hook returning the Excel row associated with the first selected widget.
 *
 * @param rows - Array of workbook rows currently loaded.
 * @param idColumn - Column containing unique identifiers or empty for index-based lookup.
 * @returns The matching row or `null` when unavailable.
 */
export function useRowData(
  rows: ExcelRow[],
  idColumn?: string,
): ExcelRow | null {
  const selection = useSelection();
  const [row, setRow] = React.useState<ExcelRow | null>(null);

  React.useEffect(() => {
    async function update(): Promise<void> {
      const widget = selection[0] as BaseItem | Group | undefined;
      if (!widget) {
        setRow(null);
        return;
      }
      try {
        const rowId = await extractRowId(widget);
        setRow(rowId ? findRow(rows, idColumn, rowId) : null);
      } catch {
        /* c8 ignore next */
        setRow(null);
      }
    }
    void update();
  }, [selection, rows, idColumn]);

  return row;
}

export { extractRowId, findRow };
