import React from 'react'

import { TabPanel } from '../components/tab-panel'

import type { TabTuple } from './tab-definitions'

/** Dummy tab for testing auto-registration. */
export const DummyTab: React.FC = () => (
  <TabPanel tabId="dummy">
    <div data-testid="dummy">Dummy</div>
  </TabPanel>
)

export const tabDefinition: TabTuple = [99, 'dummy', 'Dummy', 'Test only dummy tab', DummyTab]
