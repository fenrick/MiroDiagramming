import React from 'react';
import { tokens } from '../tokens';
import type { ExcelRow } from '../../core/utils/excel-loader';
import { useRowData } from '../hooks/use-row-data';

export interface RowInspectorProps {
  /** Rows loaded from the workbook. */
  rows: ExcelRow[];
  /** Optional column holding unique identifiers. */
  idColumn?: string;
}

/**
 * Display the Excel row linked to the selected widget.
 */
export function RowInspector({
  rows,
  idColumn,
}: RowInspectorProps): React.JSX.Element | null {
  const row = useRowData(rows, idColumn);
  if (!row) return null;

  return (
    <div
      data-testid='row-inspector'
      style={{ marginTop: tokens.space.small }}>
      <strong>Row Values</strong>
      <ul style={{ maxHeight: 120, overflowY: 'auto' }}>
        {Object.entries(row).map(([k, v]) => (
          <li key={k}>
            <code>{k}</code>: {String(v)}
          </li>
        ))}
      </ul>
    </div>
  );
}
