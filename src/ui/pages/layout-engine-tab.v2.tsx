import React from 'react'
import { PageHelp } from '../components/page-help'
import { TabPanel } from '../components/tab-panel'

export const LayoutEngineTabV2: React.FC = () => (
  <TabPanel tabId="layout">
    <PageHelp content="Layout engine previews and tuning" />
    <section className="stack-sm" title="Preview">
      <p>Layout engine coming soon.</p>
    </section>
  </TabPanel>
)

export default LayoutEngineTabV2
