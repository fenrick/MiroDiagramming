import React from 'react'
import { Box } from '@mirohq/design-system'

/**
 * Constrains its children to the Miro panel dimensions.
 * Applies a 320&nbsp;dp max width with 24&nbsp;dp side padding.
 * Use at the top level of any screen rendered in a panel.
 */
export function PanelShell({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <Box
      css={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        height: '100%',
        boxSizing: 'border-box',
        maxWidth: 'var(--size-drawer)',
        paddingLeft: '$100',
        paddingRight: '$100',
        margin: 0,
      }}
    >
      {children}
    </Box>
  )
}
