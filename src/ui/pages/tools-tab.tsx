import { Tabs } from '@mirohq/design-system'
import { space } from '@mirohq/design-tokens'
import React from 'react'

import { PageHelp } from '../components/page-help'
import { TabPanel } from '../components/tab-panel'

import { ArrangeTab } from './arrange-tab'
import { FramesTab } from './frames-tab'
import { ResizeTab } from './resize-tab'
import { StyleTab } from './style-tab'
import type { TabTuple } from './tab-definitions'

type SubTabId = 'size' | 'style' | 'arrange' | 'frames'

interface TabItem {
  id: SubTabId
  label: string
}

const SUB_TABS: TabItem[] = [
  { id: 'size', label: 'Size' },
  { id: 'style', label: 'Colours' },
  { id: 'arrange', label: 'Arrange' },
  { id: 'frames', label: 'Frames' },
]

const SUB_TAB_COMPONENTS = new Map<SubTabId, React.FC>([
  ['size', ResizeTab],
  ['style', StyleTab],
  ['arrange', ArrangeTab],
  ['frames', FramesTab],
])

const LAST_USED_SUB_TAB_KEY = 'miro.tools.last-sub-tab'
const DEFAULT_SUB_TAB: SubTabId = 'size'

const isSubTabId = (value: string | null): value is SubTabId =>
  value !== null && SUB_TABS.some((tab) => tab.id === value)

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

export const ToolsTab: React.FC = () => {
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
    <TabPanel tabId="tools">
      <PageHelp content="Adjust size, style, arrange and frame utilities" />
      <Tabs value={sub} variant="tabs" onChange={handleChange} size="medium">
        <Tabs.List
          aria-label="Tool categories"
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
            const Component = SUB_TAB_COMPONENTS.get(id)
            if (!Component) {
              return null
            }
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
  5,
  'tools',
  'Tools',
  'Adjust size, style, arrange and frame utilities',
  ToolsTab,
]
