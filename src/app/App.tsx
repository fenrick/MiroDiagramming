import { Tabs } from '@mirohq/design-system'
import * as React from 'react'

import { Tooltip } from '../ui/components'
import { Paragraph } from '../ui/components/paragraph'
import { ToastContainer } from '../ui/components/toast'
import { PanelShell } from '../ui/panel-shell'
import { ScrollArea } from '../ui/scroll-area'
import { type Tab, TAB_DATA } from '../ui/pages/tabs'

/**
 * React entry component that renders the file selection and mode
 * toggling user interface. Extraction as an exported constant allows
 * the component to be reused in tests without side effects.
 */
function AppShell(): React.JSX.Element {
  const [tab, setTab] = React.useState<Tab>(TAB_DATA[0]![1])
  // Tab ids available for data-driven rendering only
  const current = TAB_DATA.find((t) => t[1] === tab)!
  const CurrentComp = current[4]
  // No global keyboard shortcuts or command palette in Miro add-ins.

  return (
    <ScrollArea>
      <Tabs
        value={tab}
        onChange={(id: string) => {
          setTab(id as Tab)
        }}
        variant={'tabs'}
        size="medium"
      >
        <Tabs.List>
          {TAB_DATA.map((t) => (
            <Tabs.Trigger key={t[1]} value={t[1]} aria-label={t[2]}>
              <Tooltip content={t[2]}>
                <span className="truncate">{t[2]}</span>
              </Tooltip>
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </Tabs>
      <div aria-label="Panel content">
        <Paragraph>{current[3]}</Paragraph>
        <CurrentComp />
      </div>
      <ToastContainer />
    </ScrollArea>
  )
}

export const App: React.FC = () => {
  return (
    <PanelShell>
      <AppShell />
    </PanelShell>
  )
}
