{
  (Meta, StoryObj);
}
from;
('@storybook/react');
{
  JSX;
}
from;
('react');
import React from 'react';
import { RowInspector } from '../ui/components/RowInspector';
import { ExcelStoryWrapper } from './ExcelStoryWrapper';

const meta: Meta<typeof RowInspector> = {
  title: 'Components/RowInspector',
  component: RowInspector,
};
export default meta;

type Story = StoryObj<typeof RowInspector>;

function Wrapper(): JSX.Element {
  const rows = React.useMemo(() => [{ ID: '1', Name: 'A' }], []);
  return (
    <ExcelStoryWrapper rows={rows}>
      <RowInspector
        rows={rows}
        idColumn='ID'
      />
    </ExcelStoryWrapper>
  );
}

export const Default: Story = { render: () => <Wrapper /> };
