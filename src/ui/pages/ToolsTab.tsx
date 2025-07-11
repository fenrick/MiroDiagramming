import React from 'react';
import { TabBar, TabItem } from '../components/TabBar';
import { ResizeTab } from './ResizeTab';
import { StyleTab } from './StyleTab';
import { ArrangeTab } from './ArrangeTab';
import { FramesTab } from './FramesTab';
import { TabPanel } from '../components/TabPanel';
import type { TabTuple } from './tab-definitions';

const SUB_TABS: TabItem[] = [
  { id: 'size', label: 'Size' },
  { id: 'style', label: 'Colours' },
  { id: 'arrange', label: 'Arrange' },
  { id: 'frames', label: 'Frames' },
];

/**
 * Combines editing tools into a single tab with sub navigation.
 */
export const ToolsTab: React.FC = () => {
  const [sub, setSub] = React.useState<string>('resize');
  let Current: React.FC;
  switch (sub) {
    case 'style':
      Current = StyleTab;
      break;
    case 'arrange':
      Current = ArrangeTab;
      break;
    case 'frames':
      Current = FramesTab;
      break;
    default:
      Current = ResizeTab;
  }
  return (
    <TabPanel tabId='tools'>
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
  5,
  'tools',
  'Tools',
  'Adjust size, style, arrange and frame utilities',
  ToolsTab,
];
