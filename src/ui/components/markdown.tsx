import createDOMPurify from 'dompurify'
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
type DomPurifyInstance = ReturnType<typeof createDOMPurify>

let cachedPurifier: DomPurifyInstance | null | undefined

const resolveWindow = (): Window | null => {
  if (typeof globalThis === 'undefined') {
    return null
  }
  const candidate = (globalThis as typeof globalThis & { window?: Window }).window
  return typeof candidate === 'object' ? candidate : null
}

const getPurifier = (): DomPurifyInstance | null => {
  if (cachedPurifier !== undefined) {
    return cachedPurifier
  }
  const browserWindow = resolveWindow()
  if (!browserWindow) {
    cachedPurifier = null
    return null
  }
  cachedPurifier = createDOMPurify(browserWindow)
  return cachedPurifier
}

const sanitizeHtml = (content: string): string => {
  const purifier = getPurifier()
  if (!purifier) {
    // SSR/tests without a DOM fall back to the raw HTML string.
    return content
  }
  return purifier.sanitize(content, { USE_PROFILES: { html: true } })
}

export function Markdown({ source, className }: MarkdownProperties): React.JSX.Element {
  const html = React.useMemo(() => sanitizeHtml(marked.parse(source)), [source])
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
}
