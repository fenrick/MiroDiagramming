import type { Meta, StoryObj } from '@storybook/react';
import { FormGroup } from '../ui/components/FormGroup';

const meta: Meta<typeof FormGroup> = {
  title: 'Components/FormGroup',
  component: FormGroup,
};
export default meta;

type Story = StoryObj<typeof FormGroup>;

export const Default: Story = {
  render: (args) => <FormGroup {...args}>Content</FormGroup>,
};
