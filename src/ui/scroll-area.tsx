import React from 'react'
import { Box } from '@mirohq/design-system'
import { ScrollArea as DSScrollArea } from '@mirohq/design-system-scroll-area'

/**
 * DS-based scroll area sized for the Miro side panel.
 */
export function ScrollArea({
  children,
}: {
  readonly children: React.ReactNode
}): React.JSX.Element {
  return (
    <Box css={{ flex: 1, minHeight: 0, height: '100%' }}>
      <DSScrollArea type="hover" css={{ height: '100%' }}>
        <DSScrollArea.Viewport>
          <div
            style={{
              flex: 1,
              paddingTop: 'var(--space-200)',
              paddingBottom: 'var(--space-300)',
              scrollbarGutter: 'stable both-edges',
              overscrollBehavior: 'contain',
            }}
          >
            {children}
          </div>
        </DSScrollArea.Viewport>
        <DSScrollArea.Scrollbar orientation="vertical">
          <DSScrollArea.Thumb />
        </DSScrollArea.Scrollbar>
      </DSScrollArea>
    </Box>
  )
}
