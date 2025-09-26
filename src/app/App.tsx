import { Tabs } from '@mirohq/design-system'
import * as React from 'react'

import { CommandPalette, Tooltip } from '../ui/components'
import { Paragraph } from '../ui/components/Paragraph'
import { useKeybinding } from '../core/hooks/useKeybinding'
import { ToastContainer } from '../ui/components/Toast'
import { PanelShell } from '../ui/PanelShell'
import { ScrollArea } from '../ui/ScrollArea'
import { type Tab, TAB_DATA } from '../ui/pages/tabs'

/**
 * React entry component that renders the file selection and mode
 * toggling user interface. Extraction as an exported constant allows
 * the component to be reused in tests without side effects.
 */
function AppShell(): React.JSX.Element {
  const [tab, setTab] = React.useState<Tab>(TAB_DATA[0]![1])
  const [showPalette, setShowPalette] = React.useState(false)
  const tabIds = React.useMemo(() => TAB_DATA.map((t) => t[1]!), [])
  const kbRef = useKeybinding([
    { ctrl: true, key: 'k', onMatch: () => setShowPalette(true) },
    { meta: true, key: 'k', onMatch: () => setShowPalette(true) },
    ...tabIds.map((_, i) => ({
      ctrl: true,
      alt: true,
      key: String(i + 1),
      onMatch: () => setTab(tabIds[i]!),
    })),
  ])
  const current = TAB_DATA.find((t) => t[1] === tab)!
  const CurrentComp = current[4]
  const commands = React.useMemo(
    () =>
      TAB_DATA.map((t) => ({
        id: `tab-${t[1]}`,
        label: t[2],
        action: () => setTab(t[1]!),
      })),
    [setTab],
  )

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
      <div ref={kbRef} aria-label="Panel content">
        <Paragraph>{current[3]}</Paragraph>
        <CurrentComp />
      </div>
      <CommandPalette
        isOpen={showPalette}
        onClose={() => setShowPalette(false)}
        commands={commands}
      />
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
