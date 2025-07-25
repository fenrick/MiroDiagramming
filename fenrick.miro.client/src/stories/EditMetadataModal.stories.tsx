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
import { EditMetadataModal } from '../ui/components/EditMetadataModal';
import { ExcelStoryWrapper } from './ExcelStoryWrapper';

const meta: Meta<typeof EditMetadataModal> = {
  title: 'Components/EditMetadataModal',
  component: EditMetadataModal,
};
export default meta;

type Story = StoryObj<typeof EditMetadataModal>;

function Wrapper(): JSX.Element {
  const rows = React.useMemo(() => [{ ID: '1', Name: 'Alice' }], []);
  return (
    <ExcelStoryWrapper rows={rows}>
      <EditMetadataModal
        isOpen
        onClose={() => {}}
      />
    </ExcelStoryWrapper>
  );
}

export const Default: Story = { render: () => <Wrapper /> };
