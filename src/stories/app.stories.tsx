import type { Meta, StoryObj } from '@storybook/react'

import { App } from '../app/app'

const meta: Meta<typeof App> = {
  title: 'Pages/App',
  component: App,
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj<typeof App>

export const Default: Story = {}
