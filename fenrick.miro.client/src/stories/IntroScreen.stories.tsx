{
  Meta, StoryObj
}
from;
"@storybook/react";
import { IntroScreen } from "../ui/components/IntroScreen";

const meta: Meta<typeof IntroScreen> = {
  title: "Components/IntroScreen",
  component: IntroScreen,
};
export default meta;

type Story = StoryObj<typeof IntroScreen>;

export const Default: Story = { args: { onStart: () => alert("start") } };
