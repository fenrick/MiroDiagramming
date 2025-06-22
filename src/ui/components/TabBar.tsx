import React from 'react';
import type { Tab } from '../../app/app';

const primaryTabs: Tab[] = ['diagram', 'cards', 'resize', 'style', 'grid'];
const extraTabs: Tab[] = ['templates', 'export', 'data', 'comment'];

export const allTabs: Tab[] = [...primaryTabs, ...extraTabs];

/** Tab bar with an overflow menu for additional tabs. */
export const TabBar: React.FC<{ tab: Tab; onChange: (t: Tab) => void }> = ({
  tab,
  onChange,
}) => (
  <nav className='tabs' role='tablist'>
    {primaryTabs.map(t => (
      <button
        key={t}
        role='tab'
        className={`tab ${tab === t ? 'tab-active' : ''}`}
        onClick={() => onChange(t)}
      >
        {t.charAt(0).toUpperCase() + t.slice(1)}
      </button>
    ))}
    <details className='tab'>
      <summary>More</summary>
      <div>
        {extraTabs.map(t => (
          <button
            key={t}
            role='tab'
            className={`tab ${tab === t ? 'tab-active' : ''}`}
            onClick={() => onChange(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
    </details>
  </nav>
);
