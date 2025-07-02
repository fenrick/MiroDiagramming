import React from 'react';
import { StructuredTab } from './StructuredTab';
import { CardsTab } from './CardsTab';
import { LayoutEngineTab } from './LayoutEngineTab';
import { TabPanel } from '../components/TabPanel';
import type { TabTuple } from './tab-definitions';
import { Tabs } from '@mirohq/design-system';
import { Panel } from '../components/legacy';

/**
 * Parent tab hosting diagram-related tools via nested navigation.
 */
type TabItem = { id: string; label: string };

const SUB_TABS: TabItem[] = [
  { id: 'structured', label: 'Structured' },
  { id: 'cards', label: 'Cards' },
  { id: 'layout', label: 'Layout Engine' },
];

export const DiagramsTab: React.FC = () => {
  const [sub, setSub] = React.useState('structured');
  let Current: React.FC;
  switch (sub) {
    case 'cards':
      Current = CardsTab;
      break;
    case 'layout':
      Current = LayoutEngineTab;
      break;
    default:
      Current = StructuredTab;
  }
  return (
    <TabPanel tabId='diagrams'>
      <Panel padding='small'>
        <Tabs
          value={sub}
          variant={'buttons'}
          onChange={(id) => setSub(id as string)}
          size='medium'>
          <Tabs.List>
            {SUB_TABS.map((t) => (
              <Tabs.Trigger
                key={t.id}
                value={t.id}>
                {t.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </Tabs>
        <Current />
      </Panel>
    </TabPanel>
  );
};

export const tabDef: TabTuple = [
  1,
  'diagrams',
  'Diagrams',
  'Import data or experiment with the layout engine',
  DiagramsTab,
];
