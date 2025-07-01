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
}> = ({ tabs, tab, onChange }) => {
  const refs = React.useRef<HTMLButtonElement[]>([]);
  const focusTab = (idx: number): void => {
    refs.current[idx]?.focus();
  };

  return (
    <div
      role='tablist'
      className='tabs tabs-small'>
      <div className='tabs-header-list'>
        {tabs.map((t, idx) => (
          <button
            key={t.id}
            ref={(el) => {
              if (el) refs.current[idx] = el;
            }}
            id={`tab-${t.id}`}
            type='button'
            role='tab'
            className={`tab ${tab === t.id ? 'tab-active' : ''}`}
            onClick={() => onChange(t.id)}
            onKeyDown={(e) => {
              switch (e.key) {
                case 'ArrowRight':
                  e.preventDefault();
                  focusTab((idx + 1) % tabs.length);
                  break;
                case 'ArrowLeft':
                  e.preventDefault();
                  focusTab((idx - 1 + tabs.length) % tabs.length);
                  break;
                case 'Home':
                  e.preventDefault();
                  focusTab(0);
                  break;
                case 'End':
                  e.preventDefault();
                  focusTab(tabs.length - 1);
                  break;
                case 'Enter':
                case ' ': {
                  e.preventDefault();
                  onChange(t.id);
                  break;
                }
                default:
                  break;
              }
            }}>
            <span className='tab-text'>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
