import React from 'react';
import type { Tab, TabTuple } from '../pages/tabs';
import { tokens } from '../tokens';

/** Tab bar with an overflow menu for additional tabs. */
export const TabBar: React.FC<{
  tabs: TabTuple[];
  tab: Tab;
  onChange: (t: Tab) => void;
}> = ({ tabs, tab, onChange }) => (
  <div
    className='tabs'
    style={{ margin: tokens.space.xxsmall }}>
    <div className='tabs-header-list'>
      {tabs.map(([, id, label]) => (
        <button
          key={id}
          type='button'
          role='tab'
          className={`tab ${tab === id ? 'tab-active' : ''}`}
          onClick={() => onChange(id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onChange(id);
            }
          }}>
          <span className='tab-text'>{label}</span>
        </button>
      ))}
    </div>
  </div>
);
