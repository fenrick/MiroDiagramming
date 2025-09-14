import { Tabs } from '@mirohq/design-system'
import * as React from 'react'

import type { ExcelRow } from '../core/utils/excel-loader'
import { AuthBanner } from '../components/AuthBanner'
import { SyncStatusBar } from '../components/SyncStatusBar'
import { EditMetadataModal, IntroScreen, Tooltip } from '../ui/components'
import { Paragraph } from '../ui/components/Paragraph'
import { ExcelDataProvider } from '../ui/hooks/excel-data-context'
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
  const [rows, setRows] = React.useState<ExcelRow[]>([])
  const [idColumn, setIdColumn] = React.useState('')
  const [labelColumn, setLabelColumn] = React.useState('')
  const [templateColumn, setTemplateColumn] = React.useState('')
  const [showMeta, setShowMeta] = React.useState(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('command') === 'edit-metadata'
  })
  const tabIds = React.useMemo(() => TAB_DATA.map((t) => t[1]!), [])
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey) {
        const idx = parseInt(e.key, 10)
        if (idx >= 1 && idx <= tabIds.length) {
          setTab(tabIds[idx - 1]!)
        }
        if (e.key.toLowerCase() === 'm') {
          setShowMeta(true)
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [tabIds])
  const current = TAB_DATA.find((t) => t[1] === tab)!
  const CurrentComp = current[4]

  return (
    <ScrollArea>
      <ExcelDataProvider
        value={{
          rows,
          idColumn,
          labelColumn,
          templateColumn,
          setRows,
          setIdColumn,
          setLabelColumn,
          setTemplateColumn,
        }}
      >
        <AuthBanner />
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
        <SyncStatusBar />
        <Paragraph>{current[3]}</Paragraph>
        <CurrentComp />
        <EditMetadataModal isOpen={showMeta} onClose={() => setShowMeta(false)} />
        <ToastContainer />
      </ExcelDataProvider>
    </ScrollArea>
  )
}

/**
 * Root component that defers loading the main UI until the user
 * explicitly starts the session. This avoids initial Miro API calls
 * triggered by various tabs.
 */
export const App: React.FC = () => {
  const [started, setStarted] = React.useState(false)
  return (
    <PanelShell>
      {started ? <AppShell /> : <IntroScreen onStart={() => setStarted(true)} />}
    </PanelShell>
  )
}
