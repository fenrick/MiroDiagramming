import * as React from 'react';
import { createRoot } from 'react-dom/client';

import { ResizeTab } from '../ui/pages/ResizeTab';
import { StyleTab } from '../ui/pages/StyleTab';
import { GridTab } from '../ui/pages/GridTab';
import { DiagramTab } from '../ui/pages/DiagramTab';
import { CardsTab } from '../ui/pages/CardsTab';
import { TemplatesTab } from '../ui/pages/TemplatesTab';
import { ExportTab } from '../ui/pages/ExportTab';
import { DataTab } from '../ui/pages/DataTab';
import { CommentTab } from '../ui/pages/CommentTab';
import { TabBar, allTabs } from '../ui/components/TabBar';

export type Tab =
  | 'diagram'
  | 'cards'
  | 'resize'
  | 'style'
  | 'grid'
  | 'templates'
  | 'export'
  | 'data'
  | 'comment';

/**
 * React entry component that renders the file selection and mode
 * toggling user interface. Extraction as an exported constant allows
 * the component to be reused in tests without side effects.
 */
export const App: React.FC = () => {
  const [tab, setTab] = React.useState<Tab>('diagram');
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey) {
        const idx = parseInt(e.key, 10);
        if (idx >= 1 && idx <= allTabs.length) {
          setTab(allTabs[idx - 1]);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
  return (
    <div className='dnd-container'>
      <TabBar tab={tab} onChange={setTab} />
      {tab === 'diagram' && <DiagramTab />}
      {tab === 'cards' && <CardsTab />}
      {tab === 'resize' && <ResizeTab />}
      {tab === 'style' && <StyleTab />}
      {tab === 'grid' && <GridTab />}
      {tab === 'templates' && <TemplatesTab />}
      {tab === 'export' && <ExportTab />}
      {tab === 'data' && <DataTab />}
      {tab === 'comment' && <CommentTab />}
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
