import { IconButton, IconQuestionMarkCircle } from '@mirohq/design-system'
import type { Meta, StoryObj } from '@storybook/react'

import { Tooltip } from '../ui/components/tooltip'

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
}
export default meta

type Story = StoryObj<typeof Tooltip>

export const Default: Story = {
  args: {
    content: 'Helpful info',
    children: (
      <IconButton aria-label="Help">
        <IconQuestionMarkCircle />
      </IconButton>
    ),
  },
}
