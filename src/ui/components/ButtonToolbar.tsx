import { Flex } from '@mirohq/design-system'
import React from 'react'

import { Button as OurButton } from './Button'

export interface ButtonToolbarProps {
  /** Optional className for container styling. */
  className?: string
  /** Buttons to display inside the toolbar. */
  children: React.ReactNode
}

/**
 * Wraps design-system Toolbar to arrange buttons consistently.
 */
export function ButtonToolbar({ className, children }: ButtonToolbarProps): React.JSX.Element {
  return (
    <Flex className={className} direction="column" gap={100}>
      {React.Children.toArray(children).map((node) => {
        if (!React.isValidElement(node)) return node as React.ReactElement
        // Use child-provided key; do not synthesize index-based keys
        const childKey = (node as React.ReactElement).key ?? undefined
        // Make buttons full-width by default for readability in the panel
        if (node.type === OurButton) {
          return React.cloneElement(node, { fluid: true })
        }
        // Fallback: wrap unknown children in a block-level container
        return (
          <div key={childKey as React.Key | undefined} style={{ width: '100%' }}>
            {node as React.ReactElement}
          </div>
        )
      })}
    </Flex>
  )
}
