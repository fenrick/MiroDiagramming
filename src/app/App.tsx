import * as React from 'react';
import { createRoot } from 'react-dom/client';

import { TabBar } from '../ui/components/TabBar';
import { TAB_DATA, Tab } from '../ui/pages/tabs';
import { Paragraph } from '../ui/components/legacy/Paragraph';

/**
 * React entry component that renders the file selection and mode
 * toggling user interface. Extraction as an exported constant allows
 * the component to be reused in tests without side effects.
 */
export const App: React.FC = () => {
  const [tab, setTab] = React.useState<Tab>(TAB_DATA[0][1]);
  const tabIds = React.useMemo(() => TAB_DATA.map((t) => t[1]), []);
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey) {
        const idx = parseInt(e.key, 10);
        if (idx >= 1 && idx <= tabIds.length) {
          setTab(tabIds[idx - 1]);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [tabIds]);
  const current = TAB_DATA.find((t) => t[1] === tab)!;
  const CurrentComp = current[4];
  return (
    <div id='root'>
      <TabBar
        tabs={TAB_DATA}
        tab={tab}
        onChange={setTab}
      />
      <div className='scrollable'>
        <h2>{current[2]}</h2>
        <Paragraph>{current[3]}</Paragraph>
        <CurrentComp />
      </div>
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
