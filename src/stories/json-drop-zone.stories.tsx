import type { Meta, StoryObj } from '@storybook/react'

import { JsonDropZone } from '../ui/components/json-drop-zone'

const meta: Meta<typeof JsonDropZone> = {
  title: 'Components/JsonDropZone',
  component: JsonDropZone,
}
export default meta

type Story = StoryObj<typeof JsonDropZone>

export const Default: Story = { args: { onFiles: () => {} } }
