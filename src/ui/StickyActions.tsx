import React from 'react'
import { Box } from '@mirohq/design-system'

/**
 * Anchors action elements to the bottom of a panel while allowing
 * surrounding content to scroll beneath.
 *
 * Place this inside {@link PanelShell} so primary controls remain visible in
 * narrow panels.
 *
 * @param children React nodes to render inside the sticky container.
 * @returns A container that keeps its children fixed to the panel bottom.
 */
export function StickyActions({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <Box
      css={{
        position: 'sticky',
        bottom: 0,
        background: '$background-neutrals',
        borderTop: '1px solid $border-primary',
        paddingTop: '$200',
        paddingBottom: '$200',
      }}
    >
      {children}
    </Box>
  )
}
