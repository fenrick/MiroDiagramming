import { Toolbar } from '@mirohq/design-system'
import React from 'react'

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
    <Toolbar className={className} orientation="vertical">
      {React.Children.map(children, (child, index) => (
        <Toolbar.Item asChild key={index}>
          {child as React.ReactElement}
        </Toolbar.Item>
      ))}
    </Toolbar>
  )
}
