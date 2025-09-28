import { Tabs } from '@mirohq/design-system'
import { space } from '@mirohq/design-tokens'
import React from 'react'

import { isMermaidEnabled } from '../../core/mermaid'
import { PageHelp } from '../components/page-help'
import { TabPanel } from '../components/tab-panel'

import { CardsTab } from './cards-tab'
import { LayoutEngineTab } from './layout-engine-tab'
import { MermaidTab } from './mermaid-tab'
import { StructuredTab } from './structured-tab'
import type { TabTuple } from './tab-definitions'

/**
 * Parent tab hosting diagram-related tools via nested navigation.
 */
type SubTabId = 'structured' | 'cards' | 'layout' | 'mermaid'

type TabItem = { id: SubTabId; label: string }

const ALL_SUB_TABS: TabItem[] = [
  { id: 'structured', label: 'Structured' },
  { id: 'cards', label: 'Cards' },
  { id: 'layout', label: 'Layout Engine' },
  { id: 'mermaid', label: 'Mermaid' },
]

const SUB_TAB_COMPONENTS: Record<SubTabId, React.FC> = {
  structured: StructuredTab,
  cards: CardsTab,
  layout: LayoutEngineTab,
  mermaid: MermaidTab,
}

const LAST_USED_SUB_TAB_KEY = 'miro.diagrams.last-sub-tab'
const DEFAULT_SUB_TAB: SubTabId = 'structured'

const isVisibleSubTabId = (value: string | null, tabs: readonly TabItem[]): value is SubTabId =>
  value !== null && tabs.some((tab) => tab.id === value)

const getStoredSubTab = (tabs: readonly TabItem[]): SubTabId => {
  if (typeof globalThis === 'undefined') {
    return tabs[0]?.id ?? DEFAULT_SUB_TAB
  }
  try {
    const stored = globalThis.localStorage?.getItem(LAST_USED_SUB_TAB_KEY) ?? null
    if (isVisibleSubTabId(stored, tabs)) {
      return stored
    }
  } catch {
    // Ignore storage errors (e.g. private mode or security restrictions)
  }
  return tabs[0]?.id ?? DEFAULT_SUB_TAB
}

export const DiagramsTab: React.FC = () => {
  const mermaidEnabled = isMermaidEnabled()
  const subTabs = React.useMemo(
    () => (mermaidEnabled ? ALL_SUB_TABS : ALL_SUB_TABS.filter((tab) => tab.id !== 'mermaid')),
    [mermaidEnabled],
  )
  const [sub, setSub] = React.useState<SubTabId>(() => getStoredSubTab(subTabs))

  React.useEffect(() => {
    if (isVisibleSubTabId(sub, subTabs)) {
      return
    }
    setSub(getStoredSubTab(subTabs))
  }, [sub, subTabs])

  const handleChange = React.useCallback(
    (id: string) => {
      const next = isVisibleSubTabId(id, subTabs) ? id : getStoredSubTab(subTabs)
      setSub(next)
      try {
        globalThis.localStorage?.setItem(LAST_USED_SUB_TAB_KEY, next)
      } catch {
        // Ignore storage errors; UX already updated locally
      }
    },
    [subTabs],
  )

  React.useEffect(() => {
    try {
      globalThis.localStorage?.setItem(LAST_USED_SUB_TAB_KEY, sub)
    } catch {
      // Ignore storage errors; UX already updated locally
    }
  }, [sub])

  return (
    <TabPanel tabId="diagrams">
      <PageHelp content="Import data or experiment with the layout engine" />
      <Tabs value={sub} variant="tabs" onChange={handleChange} size="medium">
        <Tabs.List
          aria-label="Diagram tools"
          style={{ display: 'flex', flexWrap: 'wrap', gap: space[100] }}
        >
          {subTabs.map((t) => (
            <Tabs.Trigger key={t.id} value={t.id} style={{ flex: '1 1 auto' }}>
              {t.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        <div style={{ marginTop: space[200] }}>
          {subTabs.map(({ id }) => {
            const Component = SUB_TAB_COMPONENTS[id]
            return (
              <Tabs.Content key={id} value={id} asChild>
                <Component />
              </Tabs.Content>
            )
          })}
        </div>
      </Tabs>
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
