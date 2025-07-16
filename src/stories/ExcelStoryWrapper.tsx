import React from 'react';
import type { JSX } from 'react';
import type { ExcelRow } from '../core/utils/excel-loader';
import { ExcelDataProvider } from '../ui/hooks/excel-data-context';

interface BoardItem {
  getMetadata: () => Promise<{ rowId: string }>;
}

interface StubBoard {
  getSelection: () => Promise<BoardItem[]>;
  ui: { on: () => void; off: () => void };
}

export interface ExcelStoryWrapperProps {
  /**
   * Initial rows to expose via {@link ExcelDataProvider}.
   */
  rows: ExcelRow[];
  /**
   * React nodes to render within the provider.
   */
  children: React.ReactNode;
}

/**
 * Wrapper component for Storybook examples that need Excel context.
 *
 * It stubs the Miro board selection API and provides the
 * {@link ExcelDataProvider} with static row data.
 */
export function ExcelStoryWrapper({
  rows,
  children,
}: ExcelStoryWrapperProps): JSX.Element {
  const memoRows = React.useMemo(() => rows, [rows]);
  React.useEffect(() => {
    const rowId = String(memoRows[0]?.ID ?? '1');
    (globalThis as unknown as { miro?: { board?: StubBoard } }).miro = {
      board: {
        getSelection: async () => [{ getMetadata: async () => ({ rowId }) }],
        ui: { on: () => {}, off: () => {} },
      },
    };
  }, [memoRows]);
  return (
    <ExcelDataProvider
      value={{
        rows: memoRows,
        idColumn: 'ID',
        labelColumn: 'Name',
        templateColumn: undefined,
        setRows: () => {},
        setIdColumn: () => {},
        setLabelColumn: () => {},
        setTemplateColumn: () => {},
      }}>
      {children}
    </ExcelDataProvider>
  );
}
