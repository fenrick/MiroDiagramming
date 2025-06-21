import * as React from 'react';
import { createRoot } from 'react-dom/client';

import { ResizeTab } from '../ui/tabs/ResizeTab';
import { StyleTab } from '../ui/tabs/StyleTab';
import { GridTab } from '../ui/tabs/GridTab';
import { DiagramTab } from '../ui/tabs/DiagramTab';
import { CardsTab } from '../ui/tabs/CardsTab';

export type Tab = 'diagram' | 'cards' | 'resize' | 'style' | 'grid';

/** Simple tab bar using Mirotone tab classes. */
const TabBar: React.FC<{ tab: Tab; onChange: (t: Tab) => void }> = ({
  tab,
  onChange,
}) => (
  <nav className='tabs' role='tablist'>
    {(['diagram', 'cards', 'resize', 'style', 'grid'] as Tab[]).map(t => (
      <button
        key={t}
        role='tab'
        className={`tab ${tab === t ? 'tab-active' : ''}`}
        onClick={() => onChange(t)}
      >
        {t.charAt(0).toUpperCase() + t.slice(1)}
      </button>
    ))}
  </nav>
);

/**
 * React entry component that renders the file selection and mode
 * toggling user interface. Extraction as an exported constant allows
 * the component to be reused in tests without side effects.
 */
export const App: React.FC = () => {
  const [tab, setTab] = React.useState<Tab>('diagram');
  return (
    <div className='dnd-container'>
      <TabBar tab={tab} onChange={setTab} />
      {tab === 'diagram' && <DiagramTab />}
      {tab === 'cards' && <CardsTab />}
      {tab === 'resize' && <ResizeTab />}
      {tab === 'style' && <StyleTab />}
      {tab === 'grid' && <GridTab />}
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
