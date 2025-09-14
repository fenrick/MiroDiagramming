import { Heading } from '@mirohq/design-system'
import React, { useState } from 'react'

import changelog from '../../../../CHANGELOG.md?raw'
import { Button, Markdown, Paragraph } from '../components'
import { PageHelp } from '../components/PageHelp'
import { TabPanel } from '../components/TabPanel'

import type { TabTuple } from './tab-definitions'

/** Static help page summarising diagram options and tools. */
export const HelpTab: React.FC = () => {
  const [showLog, setShowLog] = useState(false)

  return (
    <TabPanel tabId="help">
      <PageHelp content="Overview of diagram options and tools" />
      <Heading level={2}>Getting Started</Heading>
      <Paragraph>
        Use the Create tab to import diagrams or cards from a JSON file. Nodes may define templates,
        labels and ELK options to influence placement.
      </Paragraph>
      <Heading level={2}>Diagram Layout Options</Heading>
      <ul className="list">
        <li>
          <strong>Layered</strong> – Flow diagrams with layers
        </li>
        <li>
          <strong>Tree</strong> – Compact hierarchical tree
        </li>
        <li>
          <strong>Grid</strong> – Organic force-directed grid
        </li>
        <li>
          <strong>Nested</strong> – Containers sized to fit children
        </li>
        <li>
          <strong>Radial</strong> – Circular layout around a hub
        </li>
        <li>
          <strong>Box</strong> – Uniform box grid
        </li>
        <li>
          <strong>Rect Packing</strong> – Fits rectangles within parents
        </li>
      </ul>
      <Heading level={2}>Other Tools</Heading>
      <ul className="list">
        <li>Resize – adjust widget size or copy from selection.</li>
        <li>Frames – rename selected frames.</li>
        <li>Colours – modify fill colours.</li>
        <li>Arrange – grid and spacing tools.</li>
      </ul>
      <Heading level={2}>Changelog</Heading>
      <Button
        variant="secondary"
        onClick={() => setShowLog((v) => !v)}
        data-testid="toggle-changelog"
      >
        {showLog ? 'Hide' : 'Show'} Changelog
      </Button>
      {showLog && <Markdown source={changelog} />}
    </TabPanel>
  )
}

export const tabDef: TabTuple = [
  99,
  'help',
  'Help',
  'Overview of diagram options and tools',
  HelpTab,
]
