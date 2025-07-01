import React from 'react';

export interface SubTab {
  id: string;
  label: string;
}

/**
 * Small tab bar component used inside a parent tab.
 */
export const SubTabBar: React.FC<{
  tabs: SubTab[];
  tab: string;
  onChange: (id: string) => void;
}> = ({ tabs, tab, onChange }) => (
  <div className='tabs tabs-small'>
    <div className='tabs-header-list'>
      {tabs.map((t) => (
        <button
          key={t.id}
          type='button'
          role='tab'
          className={`tab ${tab === t.id ? 'tab-active' : ''}`}
          onClick={() => onChange(t.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onChange(t.id);
            }
          }}>
          <span className='tab-text'>{t.label}</span>
        </button>
      ))}
    </div>
  </div>
);
