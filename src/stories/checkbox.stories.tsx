import type { Meta, StoryObj } from '@storybook/react'

import { Checkbox } from '../ui/components/checkbox'

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
}
export default meta

type Story = StoryObj<typeof Checkbox>

export const Unchecked: Story = {
  args: {
    label: 'Option',
    value: false,
    onChange: (v: boolean) => {
      // Story handler to satisfy lint rules
      console.log('Checkbox change', v)
    },
  },
}

export const Checked: Story = {
  args: {
    label: 'Option',
    value: true,
    onChange: (v: boolean) => {
      console.log('Checkbox change', v)
    },
  },
}
