import * as React from 'react';
import { createRoot } from 'react-dom/client';

import { TAB_DATA, Tab } from '../ui/pages/tabs';
import { Paragraph } from '../ui/components/legacy/Paragraph';
import { EditMetadataModal } from '../ui/components/EditMetadataModal';
import { ExcelDataProvider } from '../ui/hooks/excel-data-context';
import type { ExcelRow } from '../core/utils/excel-loader';
import { Heading } from '../ui/components/legacy';
import { Tabs } from '@mirohq/design-system';

/**
 * React entry component that renders the file selection and mode
 * toggling user interface. Extraction as an exported constant allows
 * the component to be reused in tests without side effects.
 */
export const App: React.FC = () => {
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
      <div id='root'>
        <Tabs
          value='{tab}'
          onChange={(id) => setTab(id as Tab)}
          size='large'>
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
        <div className='scrollable'>
          <Heading level={2}>{current[2]}</Heading>
          <Paragraph>{current[3]}</Paragraph>
          <CurrentComp />
        </div>
        <EditMetadataModal
          isOpen={showMeta}
          onClose={() => setShowMeta(false)}
        />
      </div>
    </ExcelDataProvider>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
