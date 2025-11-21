import React from 'react'

import { Markdown } from './markdown'

type InfoCalloutProperties = Readonly<{
  title?: string
  /** Optional markdown content; rendered when provided. */
  markdown?: string
  /** Children fallback content. Hidden entirely if neither markdown nor children are provided. */
  children?: React.ReactNode
}>

/** Lightweight callout styled with Mirotone tokens. */
export function InfoCallout({
  title,
  markdown,
  children,
}: InfoCalloutProperties): React.JSX.Element | null {
  const hasContent = React.useMemo(() => {
    if (typeof markdown === 'string' && markdown.trim().length > 0) return true
    if (children === undefined || children === null) return false
    if (typeof children === 'string') return children.trim().length > 0
    return React.Children.toArray(children).some((node) =>
      typeof node === 'string' ? node.trim().length > 0 : true,
    )
  }, [markdown, children])
  if (!hasContent) return null

  return (
    <div
      style={{
        borderLeft: '4px solid var(--blue700)',
        background: 'var(--blue100)',
        padding: 'var(--space-150)',
        borderRadius: 'var(--border-radius-medium)',
      }}
      role="note"
    >
      {title ? (
        <strong style={{ display: 'block', marginBottom: 'var(--space-50)' }}>{title}</strong>
      ) : null}
      {typeof markdown === 'string' && markdown.trim().length > 0 ? (
        <Markdown source={markdown} />
      ) : (
        <div>{children}</div>
      )}
    </div>
  )
}
