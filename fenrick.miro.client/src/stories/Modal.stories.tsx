{
  Meta, StoryObj
}
from;
"@storybook/react";
import { Modal } from "../ui/components/Modal";

const meta: Meta<typeof Modal> = {
  title: "Components/Modal",
  component: Modal,
};
export default meta;

type Story = StoryObj<typeof Modal>;

export const Open: Story = {
  args: {
    title: "Example Modal",
    isOpen: true,
    onClose: () => alert("close"),
    children: "Modal content",
  },
};
