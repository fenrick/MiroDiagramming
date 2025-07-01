import React from 'react';
import type { Tab, TabTuple } from '../pages/tabs';
import { tokens } from '../tokens';

/** Tab bar with an overflow menu for additional tabs. */
export const TabBar: React.FC<{
  tabs: TabTuple[];
  tab: Tab;
  onChange: (t: Tab) => void;
}> = ({ tabs, tab, onChange }) => {
  const refs = React.useRef<HTMLButtonElement[]>([]);
  /** Move focus to the target tab index. */
  const focusTab = (idx: number): void => {
    refs.current[idx]?.focus();
  };

  return (
    <div
      role='tablist'
      className='tabs'
      style={{ margin: tokens.space.xxsmall }}>
      <div className='tabs-header-list'>
        {tabs.map(([, id, label], idx) => (
          <button
            key={id}
            ref={(el) => {
              if (el) refs.current[idx] = el;
            }}
            type='button'
            id={`tab-${id}`}
            role='tab'
            className={`tab ${tab === id ? 'tab-active' : ''}`}
            onClick={() => onChange(id)}
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
                case ' ': // Space
                  e.preventDefault();
                  onChange(id);
                  break;
                default:
                  break;
              }
            }}>
            <span className='tab-text'>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
