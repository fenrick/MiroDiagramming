import { Flex } from '@mirohq/design-system'
import React from 'react'

import { Button as OurButton } from './button'

export type ButtonToolbarProperties = Readonly<{
  /** Optional className for an outer wrapper. */
  className?: string
  /** Buttons to display inside the toolbar. */
  children: React.ReactNode
}>

/**
 * Wraps design-system Toolbar to arrange buttons consistently.
 */
export function ButtonToolbar({ className, children }: ButtonToolbarProperties): React.JSX.Element {
  const childArray = React.Children.toArray(children)

  return (
    <div className={className}>
      <Flex direction="column" gap={100}>
        {childArray.map((node, index) => {
          if (!React.isValidElement(node)) {
            return <React.Fragment key={`primitive-${String(index)}`}>{node}</React.Fragment>
          }
          // Use child-provided key; do not synthesize index-based keys
          const childKey = node.key ?? undefined
          // Make buttons full-width by default for readability in the panel
          if (node.type === OurButton) {
            return React.cloneElement(node, { fluid: true })
          }
          // Fallback: wrap unknown children in a block-level container
          return (
            <div key={childKey ?? `child-${String(index)}`} style={{ width: '100%' }}>
              {node}
            </div>
          )
        })}
      </Flex>
    </div>
  )
}
