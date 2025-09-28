import React from 'react'

import { Paragraph, SidebarSection } from '../components'
import { PageHelp } from '../components/page-help'
import { TabPanel } from '../components/tab-panel'

/** Placeholder for future layout engine options. */
export const LayoutEngineTab: React.FC = () => (
  <TabPanel tabId="layout">
    <PageHelp content="Layout engine coming soon" />
    <SidebarSection title="Preview">
      <Paragraph>Layout engine coming soon.</Paragraph>
    </SidebarSection>
  </TabPanel>
)
