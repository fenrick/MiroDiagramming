import * as React from 'react'
import { Tabs } from '@base-ui-components/react/tabs'

import { Tooltip } from '../ui/components'
import { ToastContainer } from '../ui/components/toast'
import { type Tab, TAB_DATA, type TabTuple } from '../ui/pages/tabs'

/**
 * React entry component that renders the file selection and mode
 * toggling user interface. Extraction as an exported constant allows
 * the component to be reused in tests without side effects.
 */
const NullComponent: React.FC = () => null

function AppShell(): React.JSX.Element {
  const initialTab = TAB_DATA[0]?.[1] ?? 'diagrams'
  const [tab, setTab] = React.useState<Tab>(initialTab)
  const fallbackTab: TabTuple = TAB_DATA[0] ?? [0, 'diagrams', '', '', NullComponent]
  const resolved = TAB_DATA.find((t) => t[1] === tab) ?? fallbackTab
  const instructions = resolved[3]
  const CurrentComp = resolved[4]
  // No global keyboard shortcuts or command palette in Miro add-ins.

  return (
    <div role="main" className="panel-shell">
      <Tabs.Root
        value={tab}
        onValueChange={(value) => {
          setTab(value as Tab)
        }}
        className="tabs"
      >
        <Tabs.List className="tabs-header-list">
          {TAB_DATA.map((t) => {
            const active = t[1] === tab
            return (
              <Tabs.Tab
                key={t[1]}
                value={t[1]}
                aria-label={t[3]}
                className={['tab', active ? 'tab-active' : ''].filter(Boolean).join(' ')}
              >
                <Tooltip content={t[2]}>
                  <span className="truncate">{t[2]}</span>
                </Tooltip>
              </Tabs.Tab>
            )
          })}
        </Tabs.List>
      </Tabs.Root>
      <div aria-label="Panel content">
        <div>
          <p>{instructions}</p>
          <CurrentComp />
        </div>
      </div>
      <ToastContainer />
    </div>
  )
}

export const App: React.FC = () => {
  return <AppShell />
}
