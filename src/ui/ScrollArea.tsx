import React from 'react'
import { ScrollArea as DSScrollArea } from '@mirohq/design-system-scroll-area'

/**
 * DS-based scroll area sized for the Miro side panel.
 */
export function ScrollArea({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <DSScrollArea type="hover" style={{ flex: 1, minHeight: 0 }}>
      <DSScrollArea.Viewport
        style={{
          flex: 1,
          paddingTop: 'var(--space-200)',
          paddingBottom: 'var(--space-300)',
          scrollbarGutter: 'stable both-edges',
          overscrollBehavior: 'contain',
        }}
      >
        {children}
      </DSScrollArea.Viewport>
      <DSScrollArea.Scrollbar orientation="vertical">
        <DSScrollArea.Thumb />
      </DSScrollArea.Scrollbar>
    </DSScrollArea>
  )
}
