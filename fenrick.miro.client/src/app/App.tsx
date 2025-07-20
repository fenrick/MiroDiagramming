import { createTheme, Tabs, themes } from '@mirohq/design-system';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import type { ExcelRow } from '../core/utils/excel-loader';
import { EditMetadataModal, IntroScreen } from '../ui/components';
import { Paragraph } from '../ui/components/Paragraph';
import { ExcelDataProvider } from '../ui/hooks/excel-data-context';

import { type Tab, TAB_DATA } from '../ui/pages/tabs';

const lightThemeClassName = createTheme(themes.light);

/**
 * React entry component that renders the file selection and mode
 * toggling user interface. Extraction as an exported constant allows
 * the component to be reused in tests without side effects.
 */
function AppShell(): React.JSX.Element {
  const [tab, setTab] = React.useState<Tab>(TAB_DATA[0][1]);
  const [rows, setRows] = React.useState<ExcelRow[]>([]);
  const [idColumn, setIdColumn] = React.useState('');
  const [labelColumn, setLabelColumn] = React.useState('');
  const [templateColumn, setTemplateColumn] = React.useState('');
  const [showMeta, setShowMeta] = React.useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('command') === 'edit-metadata';
  });
  const tabIds = React.useMemo(() => TAB_DATA.map((t) => t[1]), []);
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey) {
        const idx = parseInt(e.key, 10);
        if (idx >= 1 && idx <= tabIds.length) {
          setTab(tabIds[idx - 1]);
        }
        if (e.key.toLowerCase() === 'm') {
          setShowMeta(true);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [tabIds]);
  const current = TAB_DATA.find((t) => t[1] === tab)!;
  const CurrentComp = current[4];

  return (
    <div className='scrollable'>
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
        }}>
        <Tabs
          value={tab}
          onChange={(id) => setTab(id as Tab)}
          variant={'tabs'}
          size='medium'>
          <Tabs.List>
            {TAB_DATA.map((t) => (
              <Tabs.Trigger
                key={t[1]}
                value={t[1]}>
                {t[2]}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </Tabs>
        <Paragraph>{current[3]}</Paragraph>
        <CurrentComp />
        <EditMetadataModal
          isOpen={showMeta}
          onClose={() => setShowMeta(false)}
        />
      </ExcelDataProvider>
    </div>
  );
}

/**
 * Root component that defers loading the main UI until the user
 * explicitly starts the session. This avoids initial Miro API calls
 * triggered by various tabs.
 */
export const App: React.FC = () => {
  const [started, setStarted] = React.useState(false);
  return started ? (
    <AppShell />
  ) : (
    <IntroScreen onStart={() => setStarted(true)} />
  );
};

const container = document.getElementById('root');
if (container) {
  container.classList += lightThemeClassName;
  const root = createRoot(container);
  root.render(<App />);
}
