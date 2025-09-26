/**
 * Storybook entries demonstrating each sidebar tab component.
 * Parent tabs such as Tools and Diagrams host their own sub-navigation
 * but are represented here as standalone pages for review and testability.
 */
import type { Meta, StoryObj } from '@storybook/react'

import { ArrangeTab } from '../ui/pages/ArrangeTab'
import { CardsTab } from '../ui/pages/CardsTab'
import { DiagramsTab } from '../ui/pages/DiagramsTab'
import { FramesTab } from '../ui/pages/FramesTab'
import { HelpTab } from '../ui/pages/HelpTab'
import { LayoutEngineTab } from '../ui/pages/LayoutEngineTab'
import { ResizeTab } from '../ui/pages/ResizeTab'
import { SearchTab } from '../ui/pages/SearchTab'
import { StructuredTab } from '../ui/pages/StructuredTab'
import { StyleTab } from '../ui/pages/StyleTab'
import { ToolsTab } from '../ui/pages/ToolsTab'

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
