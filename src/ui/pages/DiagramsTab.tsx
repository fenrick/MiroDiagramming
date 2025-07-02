import React from 'react';
import { TabBar, TabItem } from '../components/TabBar';
import { StructuredTab } from './StructuredTab';
import { CardsTab } from './CardsTab';
import { LayoutEngineTab } from './LayoutEngineTab';
import { TabPanel } from '../components/TabPanel';
import type { TabTuple } from './tab-definitions';

/**
 * Parent tab hosting diagram-related tools via nested navigation.
 */
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
      <div>
        <TabBar
          tabs={SUB_TABS}
          tab={sub}
          onChange={setSub}
          size='small'
        />
        <Current />
      </div>
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
