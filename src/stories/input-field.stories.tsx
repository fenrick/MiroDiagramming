import type { Meta, StoryObj } from '@storybook/react'

import { InputField } from '../ui/components/input-field'

const meta: Meta<typeof InputField> = {
  title: 'Components/InputField',
  component: InputField,
}
export default meta

type Story = StoryObj<typeof InputField>

export const Default: Story = {
  args: {
    label: 'Name',
    placeholder: 'Enter text',
    onValueChange: (v: string) => {
      console.log('onValueChange', v)
    },
  },
}
