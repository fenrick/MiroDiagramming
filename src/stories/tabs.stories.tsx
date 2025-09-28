/**
 * Storybook entries demonstrating each sidebar tab component.
 * Parent tabs such as Tools and Diagrams host their own sub-navigation
 * but are represented here as standalone pages for review and testability.
 */
import type { Meta, StoryObj } from '@storybook/react'

import { ArrangeTab } from '../ui/pages/arrange-tab'
import { CardsTab } from '../ui/pages/cards-tab'
import { DiagramsTab } from '../ui/pages/diagrams-tab'
import { FramesTab } from '../ui/pages/frames-tab'
import { HelpTab } from '../ui/pages/help-tab'
import { LayoutEngineTab } from '../ui/pages/layout-engine-tab'
import { ResizeTab } from '../ui/pages/resize-tab'
import { SearchTab } from '../ui/pages/search-tab'
import { StructuredTab } from '../ui/pages/structured-tab'
import { StyleTab } from '../ui/pages/style-tab'
import { ToolsTab } from '../ui/pages/tools-tab'

const meta: Meta = {
  title: 'Pages/Tabs',
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj

export const Arrange: Story = { render: () => <ArrangeTab /> }
export const Cards: Story = { render: () => <CardsTab /> }
export const Search: Story = { render: () => <SearchTab /> }
export const Diagrams: Story = { render: () => <DiagramsTab /> }
export const Tools: Story = { render: () => <ToolsTab /> }
export const Frames: Story = { render: () => <FramesTab /> }
export const Help: Story = { render: () => <HelpTab /> }
export const LayoutEngine: Story = { render: () => <LayoutEngineTab /> }
export const Resize: Story = { render: () => <ResizeTab /> }
export const Structured: Story = { render: () => <StructuredTab /> }
export const Style: Story = { render: () => <StyleTab /> }
