import React from 'react';
import type { TabTuple } from '../pages/tabs';
import { tokens } from '../tokens';

/**
 * Minimal data required to render a tab entry.
 */
export interface TabItem {
  /** Unique identifier for the tab. */
  id: string;
  /** Visible label displayed in the tab. */
  label: string;
}

export interface TabBarProps {
  /** Tabs to render. Accepts TabTuple or TabItem objects. */
  tabs: (TabTuple | TabItem)[];
  /** Currently active tab identifier. */
  tab: string;
  /** Change handler for new tab selection. */
  onChange: (id: string) => void;
  /** Visual size variant; "small" removes margin and shrinks tabs. */
  size?: 'regular' | 'small';
}

/**
 * Accessible tab bar used for both primary and nested navigation.
 */
export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  tab,
  onChange,
  size = 'regular',
}) => {
  const refs = React.useRef<HTMLButtonElement[]>([]);

  const items = React.useMemo<TabItem[]>(
    () =>
      tabs.map((t) =>
        Array.isArray(t)
          ? ({ id: String(t[1]), label: t[2] } as TabItem)
          : (t as TabItem),
      ),
    [tabs],
  );

  /** Move focus to the target tab index. */
  const focusTab = (idx: number): void => {
    refs.current[idx]?.focus();
  };

  const className = size === 'small' ? 'tabs tabs-small' : 'tabs';

  return (
    <div
      role='tablist'
      className={className}
      style={size === 'regular' ? { margin: tokens.space.xxsmall } : undefined}>
      <div className='tabs-header-list'>
        {items.map(({ id, label }, idx) => (
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
                  focusTab((idx + 1) % items.length);
                  break;
                case 'ArrowLeft':
                  e.preventDefault();
                  focusTab((idx - 1 + items.length) % items.length);
                  break;
                case 'Home':
                  e.preventDefault();
                  focusTab(0);
                  break;
                case 'End':
                  e.preventDefault();
                  focusTab(items.length - 1);
                  break;
                case 'Enter':
                case ' ': {
                  e.preventDefault();
                  onChange(id);
                  break;
                }
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
