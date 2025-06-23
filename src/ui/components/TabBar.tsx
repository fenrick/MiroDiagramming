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
        <div
          key={id}
          role='tab'
          className={`tab ${tab === id ? 'tab-active' : ''}`}
          onClick={() => onChange(id)}>
          <div className='tab-text'>{label}</div>
        </div>
      ))}
    </div>
  </div>
);
