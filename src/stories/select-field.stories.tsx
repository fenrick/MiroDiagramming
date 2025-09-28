import type { Meta, StoryObj } from '@storybook/react'

import { SelectOption } from '../ui/components'
import { SelectField } from '../ui/components/select-field'

const meta: Meta<typeof SelectField> = {
  title: 'Components/SelectField',
  component: SelectField,
}
export default meta

type Story = StoryObj<typeof SelectField>

export const Default: Story = {
  render: (arguments_) => (
    <SelectField {...arguments_}>
      <SelectOption value="apple">Apple</SelectOption>
      <SelectOption value="banana">Banana</SelectOption>
    </SelectField>
  ),
  args: { label: 'Fruit', onChange: () => {} },
}
