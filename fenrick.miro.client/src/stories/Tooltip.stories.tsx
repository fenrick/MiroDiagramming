import { IconQuestionMarkCircle } from '@mirohq/design-system';
import { Tooltip } from '../ui/components/Tooltip';

{
  (Meta, StoryObj);
}
from;
('@storybook/react');

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
};
export default meta;

type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  args: {
    content: 'Helpful info',
    children: (
      <IconButton aria-label='Help'>
        <IconQuestionMarkCircle />
      </IconButton>
    ),
  },
};
