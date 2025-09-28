import { Callout } from '@mirohq/design-system'
import React from 'react'

import { Markdown } from './Markdown'

type InfoCalloutProperties = Readonly<{
  title?: string
  /** Optional markdown content; rendered when provided. */
  markdown?: string
  /** Children fallback content. Hidden entirely if neither markdown nor children are provided. */
  children?: React.ReactNode
}>

/**
 * Lightweight wrapper around design-system Callout for inline guidance.
 * Hides itself when there is no content to display.
 */
export function InfoCallout({
  title,
  markdown,
  children,
}: InfoCalloutProperties): React.JSX.Element | null {
  const hasContent = React.useMemo(() => {
    if (typeof markdown === 'string' && markdown.trim().length > 0) {
      return true
    }
    if (children === undefined || children === null) {
      return false
    }
    if (typeof children === 'string') {
      return children.trim().length > 0
    }
    const array = React.Children.toArray(children)
    return array.some((node) => (typeof node === 'string' ? node.trim().length > 0 : node !== null))
  }, [markdown, children])
  if (!hasContent) {
    return null
  }
  return (
    <Callout
      variant="primary"
      tone="neutral"
      title={title}
      description={
        typeof markdown === 'string' && markdown.trim().length > 0 ? (
          <Markdown source={markdown} />
        ) : (
          <div>{children}</div>
        )
      }
    />
  )
}
