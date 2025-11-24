import React from 'react'
import { Tabs } from '@base-ui-components/react/tabs'

import { PageHelp } from '../components/page-help'
import { TabPanel } from '../components/tab-panel'
import { ArrangeTabV2 } from './arrange-tab.v2'
import { FramesTab } from './frames-tab'
import { ResizeTabV2 } from './resize-tab.v2'
import { StyleTab } from './style-tab'
import { TextTab } from './text-tab'
import type { TabTuple } from './tab-definitions'

type SubTabId = 'size' | 'style' | 'text' | 'arrange' | 'frames'

interface TabItem {
  id: SubTabId
  label: string
}

const SUB_TABS: TabItem[] = [
  { id: 'size', label: 'Size' },
  { id: 'style', label: 'Colours' },
  { id: 'text', label: 'Text Tools' },
  { id: 'arrange', label: 'Arrange' },
  { id: 'frames', label: 'Frames' },
]

const SUB_TAB_COMPONENTS = new Map<SubTabId, React.FC>([
  ['size', ResizeTabV2],
  ['style', StyleTab],
  ['text', TextTab],
  ['arrange', ArrangeTabV2],
  ['frames', FramesTab],
])

const LAST_USED_SUB_TAB_KEY = 'miro.tools.last-sub-tab'
const DEFAULT_SUB_TAB: SubTabId = 'size'

const isSubTabId = (value: string | null): value is SubTabId =>
  value !== null && SUB_TABS.some((tab) => tab.id === value)

const getStorage = (): Storage | null => {
  if (typeof globalThis === 'undefined' || !('localStorage' in globalThis)) {
    return null
  }
  try {
    return globalThis.localStorage
  } catch {
    return null
  }
}

const getStoredSubTab = (): SubTabId => {
  const storage = getStorage()
  if (storage) {
    try {
      const stored = storage.getItem(LAST_USED_SUB_TAB_KEY)
      if (isSubTabId(stored)) {
        return stored
      }
    } catch {
      // Ignore storage errors (e.g. private mode or security restrictions)
    }
  }
  return DEFAULT_SUB_TAB
}

export const ToolsTab: React.FC = () => {
  const [sub, setSub] = React.useState<SubTabId>(() => getStoredSubTab())

  const handleChange = React.useCallback((id: string) => {
    const next = isSubTabId(id) ? id : DEFAULT_SUB_TAB
    setSub(next)
    const storage = getStorage()
    if (storage) {
      try {
        storage.setItem(LAST_USED_SUB_TAB_KEY, next)
      } catch {
        // Ignore storage errors; UX already updated locally
      }
    }
  }, [])

  return (
    <TabPanel tabId="tools">
      <PageHelp content="Adjust size, style, text, arrange and frame utilities" />
      <div className="stack-md">
        <Tabs.Root
          value={sub}
          onValueChange={(value) => handleChange(String(value))}
          className="tabs"
        >
          <Tabs.List className="tabs-header-list" aria-label="Tool categories">
            {SUB_TABS.map((t) => (
              <Tabs.Tab
                key={t.id}
                value={t.id}
                className={['tab', sub === t.id ? 'tab-active' : ''].filter(Boolean).join(' ')}
              >
                <div className="tab-text">{t.label}</div>
              </Tabs.Tab>
            ))}
          </Tabs.List>
          {SUB_TABS.map(({ id }) => {
            const Component = SUB_TAB_COMPONENTS.get(id)
            if (!Component) {
              return null
            }
            return (
              <Tabs.Panel key={id} value={id} style={{ paddingTop: 'var(--space-150)' }}>
                {id === sub ? <Component /> : null}
              </Tabs.Panel>
            )
          })}
        </Tabs.Root>
      </div>
    </TabPanel>
  )
}

export const tabDefinition: TabTuple = [
  5,
  'tools',
  'Tools',
  'Adjust size, style, text, arrange and frame utilities',
  ToolsTab,
]
