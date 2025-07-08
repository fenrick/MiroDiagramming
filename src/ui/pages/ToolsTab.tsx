import React from 'react';
import { ResizeTab } from './ResizeTab';
import { StyleTab } from './StyleTab';
import { ArrangeTab } from './ArrangeTab';
import { FramesTab } from './FramesTab';
import { TabPanel } from '../components/TabPanel';
import { PageHelp } from '../components/PageHelp';
import type { TabTuple } from './tab-definitions';
import { Tabs } from '@mirohq/design-system';

/**
 * Identifier string for each sub-tab.
 */
type SubTabId = 'size' | 'style' | 'arrange' | 'frames';

/**
 * Configuration object for rendering sub-tab triggers.
 */
type TabItem = { id: SubTabId; label: string };

const SUB_TABS: TabItem[] = [
  { id: 'size', label: 'Size' },
  { id: 'style', label: 'Colours' },
  { id: 'arrange', label: 'Arrange' },
  { id: 'frames', label: 'Frames' },
];

/**
 * Maps sub-tab identifiers to their respective tab components.
 */
const SUB_TAB_COMPONENTS: Record<SubTabId, React.FC> = {
  size: ResizeTab,
  style: StyleTab,
  arrange: ArrangeTab,
  frames: FramesTab,
};

/**
 * Combines editing tools into a single tab with sub navigation.
 */
export const ToolsTab: React.FC = () => {
  const [sub, setSub] = React.useState<SubTabId>('size');
  const Current = SUB_TAB_COMPONENTS[sub];
  return (
    <TabPanel tabId='tools'>
      <PageHelp content='Adjust size, style, arrange and frame utilities' />
      <Tabs
        value={sub}
        variant={'tabs'}
        onChange={(id: string) => setSub(id as SubTabId)}
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
