import React from 'react';
import { TabPanel } from '../components/TabPanel';
import type { TabTuple } from './tab-definitions';
import { Panel } from '../components';

/** Dummy tab for testing auto-registration. */
export const DummyTab: React.FC = () => (
  <TabPanel tabId='dummy'>
    <Panel padding='small'>
      <div data-testid='dummy'>Dummy</div>
    </Panel>
  </TabPanel>
);

export const tabDef: TabTuple = [
  99,
  'dummy',
  'Dummy',
  'Test only dummy tab',
  DummyTab,
];
