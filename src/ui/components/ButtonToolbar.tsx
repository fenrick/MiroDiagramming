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
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child as React.ReactElement
        // Make buttons full-width by default for readability in the panel
        if (child.type === OurButton) {
          return React.cloneElement(child, { fluid: true, key: index })
        }
        // Fallback: wrap unknown children in a block-level container
        return (
          <div key={index} style={{ width: '100%' }}>
            {child as React.ReactElement}
          </div>
        )
      })}
    </Flex>
  )
}
