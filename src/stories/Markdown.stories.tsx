import type { Meta, StoryObj } from '@storybook/react'

import { Markdown } from '../ui/components/Markdown'

const meta: Meta<typeof Markdown> = {
  title: 'Components/Markdown',
  component: Markdown,
}
export default meta

type Story = StoryObj<typeof Markdown>

export const Default: Story = {
  args: { source: '# Heading\nSome **bold** text.' },
}
