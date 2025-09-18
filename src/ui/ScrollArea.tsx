import React from 'react'

/**
 * Provides a vertically scrollable region sized for panel layouts.
 *
 * Combine with {@link StickyActions} to keep primary controls visible while
 * letting longer content flow beneath.
 *
 * @param children Elements to render inside the scroll area.
 * @returns A flex container that scrolls its children vertically.
 */
export function ScrollArea({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: 'var(--space-200) 0 var(--space-300)',
        scrollbarGutter: 'stable both-edges',
        overscrollBehavior: 'contain',
      }}
    >
      {children}
    </div>
  )
}
