import type { Meta, StoryObj } from '@storybook/react'

import { Select, SelectOption } from '../ui/components/Select'

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
}
export default meta

type Story = StoryObj<typeof Select>

export const Default: Story = {
  render: (arguments_) => (
    <Select {...arguments_}>
      <SelectOption value="one">One</SelectOption>
      <SelectOption value="two">Two</SelectOption>
    </Select>
  ),
  args: { placeholder: 'Choose', onChange: () => {} },
}
