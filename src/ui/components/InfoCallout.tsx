import { Callout } from '@mirohq/design-system'
import React from 'react'

type InfoCalloutProps = Readonly<{
  title?: string
  children: React.ReactNode
}>

/**
 * Lightweight wrapper around design-system Callout for inline guidance.
 */
export function InfoCallout({ title, children }: InfoCalloutProps): React.JSX.Element {
  return (
    <Callout
      variant="primary"
      tone="neutral"
      title={title}
      description={<div>{children}</div>}
    />
  )
}
