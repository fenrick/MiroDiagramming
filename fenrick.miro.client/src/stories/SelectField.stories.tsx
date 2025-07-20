import type { Meta, StoryObj } from '@storybook/react';
import { SelectOption } from '../ui/components';
import { SelectField } from '../ui/components/SelectField';

const meta: Meta<typeof SelectField> = {
  title: 'Components/SelectField',
  component: SelectField,
};
export default meta;

type Story = StoryObj<typeof SelectField>;

export const Default: Story = {
  render: (args) => (
    <SelectField {...args}>
      <SelectOption value='apple'>Apple</SelectOption>
      <SelectOption value='banana'>Banana</SelectOption>
    </SelectField>
  ),
  args: { label: 'Fruit', onChange: () => {} },
};
