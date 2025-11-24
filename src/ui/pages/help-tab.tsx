import React from 'react'
import changelog from '../../../CHANGELOG.md?raw'

import { Button } from '@base-ui-components/react/button'
import { Markdown } from '../components'
import { PageHelp } from '../components/page-help'
import { TabPanel } from '../components/tab-panel'
import type { TabTuple } from './tab-definitions'

export const HelpTab: React.FC = () => {
  const [showLog, setShowLog] = React.useState(false)

  return (
    <TabPanel tabId="help">
      <div>
        <PageHelp content="Overview of diagram options and tools" />

        <section title="Getting Started">
          <p>
            Use the Diagrams tab to import structured JSON/CSV, Cards to build board-linked cards,
            or Mermaid to render definitions. Configure layout options in Structured as needed.
          </p>
        </section>

        <section title="Diagram Layout Options">
          <ul className="list">
            <li>Layered – Flow diagrams with layers</li>
            <li>Tree – Compact hierarchical tree</li>
            <li>Grid – Organic force-directed grid</li>
            <li>Nested – Containers sized to fit children</li>
            <li>Radial – Circular layout around a hub</li>
            <li>Box – Uniform box grid</li>
            <li>Rect Packing – Fits rectangles within parents</li>
          </ul>
        </section>

        <section title="Other Tools">
          <ul className="list">
            <li>Resize – adjust widget size or copy from selection.</li>
            <li>Frames – rename or lock selected frames.</li>
            <li>Colours – tweak fill, opacity, and borders.</li>
            <li>Arrange – grid and spacing tools.</li>
            <li>Text – trim whitespace from selected items.</li>
          </ul>
        </section>

        <section title="Changelog">
          <Button
            className="button button-secondary button-medium"
            onClick={() => {
              setShowLog((v) => !v)
            }}
            data-testid="toggle-changelog"
          >
            {showLog ? 'Hide' : 'Show'} Changelog
          </Button>
          {showLog && <Markdown source={changelog} />}
        </section>
      </div>
    </TabPanel>
  )
}

export const tabDefinition: TabTuple = [
  99,
  'help',
  'Help',
  'Overview of diagram options and tools',
  HelpTab,
]

export default HelpTab
