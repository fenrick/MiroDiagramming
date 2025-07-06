import type { Meta, StoryObj } from '@storybook/react';
import { SegmentedControl } from '../ui/components/SegmentedControl';

const meta: Meta<typeof SegmentedControl> = {
  title: 'Components/SegmentedControl',
  component: SegmentedControl,
};
export default meta;

type Story = StoryObj<typeof SegmentedControl>;

export const Default: Story = {
  args: {
    value: 'a',
    options: [
      { label: 'A', value: 'a' },
      { label: 'B', value: 'b' },
    ],
    onChange: (v: string) => console.log(v),
  },
};
