{
  (Meta, StoryObj);
}
from;
('@storybook/react');
import { PageHelp } from '../ui/components/PageHelp';

const meta: Meta<typeof PageHelp> = {
  title: 'Components/PageHelp',
  component: PageHelp,
};
export default meta;

type Story = StoryObj<typeof PageHelp>;

export const Default: Story = { args: { content: 'Help text' } };
