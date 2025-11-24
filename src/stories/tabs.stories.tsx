/**
 * Storybook entries demonstrating each sidebar tab component.
 * Parent tabs such as Tools and Diagrams host their own sub-navigation
 * but are represented here as standalone pages for review and testability.
 */
import type { Meta, StoryObj } from '@storybook/react'

import { ArrangeTabV2 } from '../ui/pages/arrange-tab.v2'
import { CardsTabV2 } from '../ui/pages/cards-tab.v2'
import { DiagramsTab } from '../ui/pages/diagrams-tab'
import { FramesTab } from '../ui/pages/frames-tab'
import { HelpTab } from '../ui/pages/help-tab'
import { LayoutEngineTabV2 } from '../ui/pages/layout-engine-tab.v2'
import { ResizeTabV2 } from '../ui/pages/resize-tab.v2'
import { SearchTab } from '../ui/pages/search-tab'
import { StructuredTabV2 } from '../ui/pages/structured-tab.v2'
import { StyleTabV2 } from '../ui/pages/style-tab.v2'
import { ToolsTab } from '../ui/pages/tools-tab'

const meta: Meta = {
  title: 'Pages/Tabs',
  parameters: { layout: 'fullscreen' },
}
export default meta

type Story = StoryObj

export const Arrange: Story = { render: () => <ArrangeTabV2 /> }
export const Cards: Story = { render: () => <CardsTabV2 /> }
export const Search: Story = { render: () => <SearchTab /> }
export const Diagrams: Story = { render: () => <DiagramsTab /> }
export const Tools: Story = { render: () => <ToolsTab /> }
export const Frames: Story = { render: () => <FramesTab /> }
export const Help: Story = { render: () => <HelpTab /> }
export const LayoutEngine: Story = { render: () => <LayoutEngineTabV2 /> }
export const Resize: Story = { render: () => <ResizeTabV2 /> }
export const Structured: Story = { render: () => <StructuredTabV2 /> }
export const Style: Story = { render: () => <StyleTabV2 /> }
