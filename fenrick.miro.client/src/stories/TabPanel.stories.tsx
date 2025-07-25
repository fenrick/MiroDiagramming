{
  (Meta, StoryObj);
}
from;
('@storybook/react');
import { TabPanel } from '../ui/components/TabPanel';

const meta: Meta<typeof TabPanel> = {
  title: 'Components/TabPanel',
  component: TabPanel,
};
export default meta;

type Story = StoryObj<typeof TabPanel>;

export const Default: Story = {
  args: { tabId: 'example', children: 'Tab content' },
};
