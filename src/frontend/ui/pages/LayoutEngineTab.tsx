import { space } from '@mirohq/design-tokens'
import React from 'react'

import { Paragraph, SidebarSection } from '../components'
import { PageHelp } from '../components/PageHelp'
import { TabPanel } from '../components/TabPanel'

/** Placeholder for future layout engine options. */
export const LayoutEngineTab: React.FC = () => (
  <TabPanel tabId="layout" style={{ marginTop: space[200] }}>
    <PageHelp content="Layout engine coming soon" />
    <SidebarSection title="Preview">
      <Paragraph>Layout engine coming soon.</Paragraph>
    </SidebarSection>
  </TabPanel>
)
