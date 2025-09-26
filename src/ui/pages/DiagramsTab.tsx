import { Tabs } from '@mirohq/design-system'
import { space } from '@mirohq/design-tokens'
import React from 'react'

import { PageHelp } from '../components/PageHelp'
import { TabPanel } from '../components/TabPanel'

import { CardsTab } from './CardsTab'
import { LayoutEngineTab } from './LayoutEngineTab'
import { StructuredTab } from './StructuredTab'
import type { TabTuple } from './tab-definitions'

/**
 * Parent tab hosting diagram-related tools via nested navigation.
 */
type SubTabId = 'structured' | 'cards' | 'layout'

type TabItem = { id: SubTabId; label: string }

const SUB_TABS: TabItem[] = [
  { id: 'structured', label: 'Structured' },
  { id: 'cards', label: 'Cards' },
  { id: 'layout', label: 'Layout Engine' },
]

const SUB_TAB_COMPONENTS: Record<SubTabId, React.FC> = {
  structured: StructuredTab,
  cards: CardsTab,
  layout: LayoutEngineTab,
}

const LAST_USED_SUB_TAB_KEY = 'miro.diagrams.last-sub-tab'
const DEFAULT_SUB_TAB: SubTabId = 'structured'

const isSubTabId = (value: string | null): value is SubTabId =>
  value !== null && Object.prototype.hasOwnProperty.call(SUB_TAB_COMPONENTS, value)

const getStoredSubTab = (): SubTabId => {
  if (typeof globalThis === 'undefined') {
    return DEFAULT_SUB_TAB
  }
  try {
    const stored = globalThis.localStorage?.getItem(LAST_USED_SUB_TAB_KEY) ?? null
    if (isSubTabId(stored)) {
      return stored
    }
  } catch {
    // Ignore storage errors (e.g. private mode or security restrictions)
  }
  return DEFAULT_SUB_TAB
}

export const DiagramsTab: React.FC = () => {
  const [sub, setSub] = React.useState<SubTabId>(() => getStoredSubTab())

  const handleChange = React.useCallback((id: string) => {
    const next = isSubTabId(id) ? id : DEFAULT_SUB_TAB
    setSub(next)
    try {
      globalThis.localStorage?.setItem(LAST_USED_SUB_TAB_KEY, next)
    } catch {
      // Ignore storage errors; UX already updated locally
    }
  }, [])

  return (
    <TabPanel tabId="diagrams">
      <PageHelp content="Import data or experiment with the layout engine" />
      <Tabs value={sub} variant="tabs" onChange={handleChange} size="medium">
        <Tabs.List
          aria-label="Diagram tools"
          style={{ display: 'flex', flexWrap: 'wrap', gap: space[100] }}
        >
          {SUB_TABS.map((t) => (
            <Tabs.Trigger key={t.id} value={t.id} style={{ flex: '1 1 auto' }}>
              {t.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        <div style={{ marginTop: space[200] }}>
          {SUB_TABS.map(({ id }) => {
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

export const tabDef: TabTuple = [
  1,
  'diagrams',
  'Diagrams',
  'Import data or experiment with the layout engine',
  DiagramsTab,
]
