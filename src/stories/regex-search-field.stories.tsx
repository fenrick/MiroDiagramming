import type { Meta, StoryObj } from '@storybook/react'

import { RegexSearchField } from '../ui/components/regex-search-field'

const meta: Meta<typeof RegexSearchField> = {
  title: 'Components/RegexSearchField',
  component: RegexSearchField,
}
export default meta

type Story = StoryObj<typeof RegexSearchField>

export const Default: Story = {
  args: {
    label: 'Find',
    value: 'foo',
    regex: false,
    onChange: () => {},
    onRegexToggle: () => {},
  },
}
