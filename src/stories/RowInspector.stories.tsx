import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { RowInspector } from '../ui/components/RowInspector';
import { ExcelDataProvider } from '../ui/hooks/excel-data-context';

const meta: Meta<typeof RowInspector> = {
  title: 'Components/RowInspector',
  component: RowInspector,
};
export default meta;

type Story = StoryObj<typeof RowInspector>;

interface BoardItem {
  getMetadata: () => Promise<{ rowId: string }>;
}

interface StubBoard {
  getSelection: () => Promise<BoardItem[]>;
  ui: { on: () => void; off: () => void };
}

function Wrapper(): JSX.Element {
  const rows = React.useMemo(() => [{ ID: '1', Name: 'A' }], []);
  React.useEffect(() => {
    // stub board selection
    (globalThis as unknown as { miro?: { board?: StubBoard } }).miro = {
      board: {
        getSelection: async () => [
          { getMetadata: async () => ({ rowId: '1' }) },
        ],
        ui: { on: () => {}, off: () => {} },
      },
    };
  }, []);
  return (
    <ExcelDataProvider
      value={{
        rows,
        idColumn: 'ID',
        labelColumn: 'Name',
        templateColumn: undefined,
        setRows: () => {},
        setIdColumn: () => {},
        setLabelColumn: () => {},
        setTemplateColumn: () => {},
      }}>
      <RowInspector
        rows={rows}
        idColumn='ID'
      />
    </ExcelDataProvider>
  );
}

export const Default: Story = { render: () => <Wrapper /> };
