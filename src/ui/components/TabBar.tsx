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
  <div className='tabs'>
    <div className='tabs-header-list'>
      {primaryTabs.map(t => (
        <div
          key={t}
          role='tab'
          className={`tab ${tab === t ? 'tab-active' : ''}`}
          onClick={() => onChange(t)}
        >
          <div className='tab-text'>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </div>
        </div>
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
    </div>
  </div>
);
