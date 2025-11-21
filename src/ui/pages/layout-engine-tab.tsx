import React from 'react'

import { PageHelp } from '../components/page-help'
import { TabPanel } from '../components/tab-panel'

/** Placeholder for future layout engine options. */
export const LayoutEngineTab: React.FC = () => (
  <TabPanel tabId="layout">
    <PageHelp content="Layout engine coming soon" />
    <section title="Preview">
      <p>Layout engine coming soon.</p>
    </section>
  </TabPanel>
)
