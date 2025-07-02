import React from 'react';
import { tokens } from '../tokens';
import type { ExcelRow } from '../../core/utils/excel-loader';
import { useRowData } from '../hooks/use-row-data';
import { InputField } from './InputField';

export interface RowInspectorProps {
  /** Rows loaded from the workbook. */
  readonly rows: ExcelRow[];
  /** Optional column holding unique identifiers. */
  readonly idColumn?: string;
  /** Callback invoked when any cell is edited. */
  readonly onUpdate?: (index: number, row: ExcelRow) => void;
}

/**
 * Display the Excel row linked to the selected widget.
 */
export function RowInspector({
  rows,
  idColumn,
  onUpdate,
}: RowInspectorProps): React.JSX.Element | null {
  const row = useRowData(rows, idColumn);
  const [editRow, setEditRow] = React.useState<ExcelRow | null>(row);

  React.useEffect(() => {
    setEditRow(row);
  }, [row]);

  const index = row ? rows.indexOf(row) : -1;
  if (!editRow) return null;

  const handleChange =
    (key: string) =>
    (value: string): void => {
      setEditRow((prev) => {
        if (!prev) return prev;
        const next = { ...prev, [key]: value };
        onUpdate?.(index >= 0 ? index : 0, next);
        return next;
      });
    };

  return (
    <div
      data-testid='row-inspector'
      style={{ marginTop: tokens.space.small }}>
      <strong>Row Values</strong>
      <ul style={{ maxHeight: 120, overflowY: 'auto' }}>
        {Object.entries(editRow).map(([k, v]) => (
          <li key={k}>
            <InputField
              label={<code>{k}</code>}
              options={{ value: String(v) }}
              onChange={handleChange(k)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
