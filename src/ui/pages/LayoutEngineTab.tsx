import React from 'react';
import { Paragraph } from '../components';
import { TabPanel } from '../components/TabPanel';
import { PageHelp } from '../components/PageHelp';
import { space } from '@mirohq/design-tokens';

/** Placeholder for future layout engine options. */
export const LayoutEngineTab: React.FC = () => (
  <TabPanel
    tabId='layout'
    style={{ marginTop: space[200] }}>
    <PageHelp content='Layout engine coming soon' />
    <Paragraph>Layout engine coming soon.</Paragraph>
  </TabPanel>
);
