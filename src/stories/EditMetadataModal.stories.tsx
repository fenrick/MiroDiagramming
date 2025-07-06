import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { EditMetadataModal } from '../ui/components/EditMetadataModal';
import { ExcelDataProvider } from '../ui/hooks/excel-data-context';

const meta: Meta<typeof EditMetadataModal> = {
  title: 'Components/EditMetadataModal',
  component: EditMetadataModal,
};
export default meta;

type Story = StoryObj<typeof EditMetadataModal>;

interface BoardItem {
  getMetadata: () => Promise<{ rowId: string }>;
}

interface StubBoard {
  getSelection: () => Promise<BoardItem[]>;
  ui: { on: () => void; off: () => void };
}

function Wrapper(): JSX.Element {
  const rows = React.useMemo(() => [{ ID: '1', Name: 'Alice' }], []);
  React.useEffect(() => {
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
      <EditMetadataModal
        isOpen
        onClose={() => {}}
      />
    </ExcelDataProvider>
  );
}

export const Default: Story = { render: () => <Wrapper /> };
