import React from 'react'
import { Tabs } from '@base-ui-components/react/tabs'

import { usePersistentState } from '../../core/hooks/use-persistent-state'
import { isMermaidEnabled } from '../../core/mermaid'
import { PageHelp } from '../components/page-help'
import { TabPanel } from '../components/tab-panel'

import { CardsTabV2 } from './cards-tab.v2'
import { LayoutEngineTabV2 } from './layout-engine-tab.v2'
import { MermaidTabV2 } from './mermaid-tab.v2'
import { StructuredTabV2 } from './structured-tab.v2'
import type { TabTuple } from './tab-definitions'

/**
 * Parent tab hosting diagram-related tools via nested navigation.
 */
type SubTabId = 'structured' | 'cards' | 'layout' | 'mermaid'

interface TabItem {
  id: SubTabId
  label: string
}

const ALL_SUB_TABS: TabItem[] = [
  { id: 'structured', label: 'Structured' },
  { id: 'cards', label: 'Cards' },
  { id: 'layout', label: 'Layout Engine' },
  { id: 'mermaid', label: 'Mermaid' },
]

const SUB_TAB_COMPONENTS = new Map<SubTabId, React.FC>([
  ['structured', StructuredTabV2],
  ['cards', CardsTabV2],
  ['layout', LayoutEngineTabV2],
  ['mermaid', MermaidTabV2],
])

const LAST_USED_SUB_TAB_KEY = 'miro.diagrams.last-sub-tab'
const DEFAULT_SUB_TAB: SubTabId = 'structured'

const isVisibleSubTabId = (value: string | null, tabs: readonly TabItem[]): value is SubTabId =>
  value !== null && tabs.some((tab) => tab.id === value)

export const DiagramsTab: React.FC = () => {
  const mermaidEnabled = isMermaidEnabled()
  const subTabs = React.useMemo(
    () => (mermaidEnabled ? ALL_SUB_TABS : ALL_SUB_TABS.filter((tab) => tab.id !== 'mermaid')),
    [mermaidEnabled],
  )
  const [sub, setSub] = usePersistentState<SubTabId>(
    LAST_USED_SUB_TAB_KEY,
    () => subTabs[0]?.id ?? DEFAULT_SUB_TAB,
  )

  React.useEffect(() => {
    if (isVisibleSubTabId(sub, subTabs)) {
      return
    }
    setSub(subTabs[0]?.id ?? DEFAULT_SUB_TAB)
  }, [setSub, sub, subTabs])

  const handleChange = React.useCallback(
    (id: string) => {
      const next = isVisibleSubTabId(id, subTabs) ? id : (subTabs[0]?.id ?? DEFAULT_SUB_TAB)
      setSub(next)
    },
    [setSub, subTabs],
  )

  return (
    <TabPanel tabId="diagrams">
      <PageHelp content="Import data or experiment with the layout engine" />
      <div className="stack-md">
        <Tabs.Root
          value={sub}
          onValueChange={(value) => {
            handleChange(String(value))
          }}
          className="tabs"
        >
          <Tabs.List className="tabs-header-list" aria-label="Diagram tools">
            {subTabs.map((t) => (
              <Tabs.Tab
                key={t.id}
                value={t.id}
                className={['tab', sub === t.id ? 'tab-active' : ''].filter(Boolean).join(' ')}
              >
                <div className="tab-text">{t.label}</div>
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs.Root>
        <div style={{ paddingTop: 'var(--space-150)' }}>
          {(() => {
            const Component = SUB_TAB_COMPONENTS.get(sub)
            return Component ? <Component /> : null
          })()}
        </div>
      </div>
    </TabPanel>
  )
}

export const tabDefinition: TabTuple = [
  1,
  'diagrams',
  'Diagrams',
  'Import data or experiment with the layout engine',
  DiagramsTab,
]
