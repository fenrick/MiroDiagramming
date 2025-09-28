import { marked } from 'marked'
import React from 'react'

export interface MarkdownProperties {
  /** Markdown source to convert to HTML. */
  readonly source: string
  /** Optional CSS class for the container. */
  readonly className?: string
}

/**
 * Renders Markdown content using the `marked` parser.
 * The generated HTML is injected using `dangerouslySetInnerHTML`.
 */
export function Markdown({ source, className }: MarkdownProperties): React.JSX.Element {
  const html = React.useMemo(() => marked.parse(source), [source])
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
}
