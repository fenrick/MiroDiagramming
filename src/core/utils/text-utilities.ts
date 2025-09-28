/**
 * Helpers for working with textual fields on widgets.
 *
 * These functions normalise access to common text properties and are shared
 * across search utilities, sticky tagging and other features that read or
 * mutate widget text.
 */

function pushIfString(array: Array<[string, string]>, key: string, value: unknown): void {
  if (typeof value === 'string') {
    array.push([key, value])
  }
}

function pushNestedText(array: Array<[string, string]>, text: Record<string, unknown>): void {
  pushIfString(array, 'text.plainText', text.plainText)
  pushIfString(array, 'text.content', text.content)
}

/**
 * Extract all textual fields from a widget-like object.
 *
 * The returned array preserves the discovery order of fields such as `title`,
 * `content`, `plainText`, `description` and nested `text` properties.
 */
export function getTextFields(item: Record<string, unknown>): Array<[string, string]> {
  const fields: Array<[string, string]> = []
  pushIfString(fields, 'title', item.title)
  pushIfString(fields, 'content', item.content)
  pushIfString(fields, 'plainText', item.plainText)
  pushIfString(fields, 'description', item.description)
  if (typeof item.text === 'string') {
    pushIfString(fields, 'text', item.text)
  } else if (item.text && typeof item.text === 'object') {
    pushNestedText(fields, item.text as Record<string, unknown>)
  }
  return fields
}

/**
 * Retrieve a string at a dot-notated path from the given item.
 */
export function getStringAtPath(item: Record<string, unknown>, path: string): string | undefined {
  switch (path) {
    case 'title':
      return typeof (item as { title?: unknown }).title === 'string'
        ? ((item as { title?: string }).title as string)
        : undefined
    case 'content':
      return typeof (item as { content?: unknown }).content === 'string'
        ? ((item as { content?: string }).content as string)
        : undefined
    case 'plainText':
      return typeof (item as { plainText?: unknown }).plainText === 'string'
        ? ((item as { plainText?: string }).plainText as string)
        : undefined
    case 'description':
      return typeof (item as { description?: unknown }).description === 'string'
        ? ((item as { description?: string }).description as string)
        : undefined
    case 'text':
      return typeof (item as { text?: unknown }).text === 'string'
        ? ((item as { text?: string }).text as string)
        : undefined
    case 'text.plainText': {
      const nested = (item as { text?: { plainText?: unknown } }).text
      return nested && typeof nested.plainText === 'string' ? nested.plainText : undefined
    }
    case 'text.content': {
      const nested = (item as { text?: { content?: unknown } }).text
      return nested && typeof nested.content === 'string' ? nested.content : undefined
    }
    default:
      // Unsupported path: explicitly return undefined instead of dynamic lookup
      return undefined
  }
}

/**
 * Set a string at a dot-notated path on the given item.
 *
 * Attempts to mutate only existing string properties and guards against
 * prototype pollution by ignoring `__proto__` and `constructor` segments.
 */
export function setStringAtPath(item: Record<string, unknown>, path: string, value: string): void {
  switch (path) {
    case 'title': {
      const obj = item as { title?: unknown }
      if (typeof obj.title === 'string') {
        ;(item as { title?: string }).title = value
      }
      return
    }
    case 'content': {
      const obj = item as { content?: unknown }
      if (typeof obj.content === 'string') {
        ;(item as { content?: string }).content = value
      }
      return
    }
    case 'plainText': {
      const obj = item as { plainText?: unknown }
      if (typeof obj.plainText === 'string') {
        ;(item as { plainText?: string }).plainText = value
      }
      return
    }
    case 'description': {
      const obj = item as { description?: unknown }
      if (typeof obj.description === 'string') {
        ;(item as { description?: string }).description = value
      }
      return
    }
    case 'text': {
      const obj = item as { text?: unknown }
      if (typeof obj.text === 'string') {
        ;(item as { text?: string }).text = value
      }
      return
    }
    case 'text.plainText': {
      const nested = (item as { text?: { plainText?: unknown } }).text
      if (nested && typeof nested.plainText === 'string') {
        ;(nested as { plainText?: string }).plainText = value
      }
      return
    }
    case 'text.content': {
      const nested = (item as { text?: { content?: unknown } }).text
      if (nested && typeof nested.content === 'string') {
        ;(nested as { content?: string }).content = value
      }
      return
    }
    default:
      // Unsupported path; do nothing to avoid dynamic writes
      return
  }
}

/**
 * Read the primary text content from a widget-like object.
 */
export function readItemText(item: Record<string, unknown>): string | undefined {
  const text = (item as { plainText?: string }).plainText
  if (typeof text === 'string' && text.length > 0) {
    return text
  }
  const content = (item as { content?: string }).content
  if (typeof content === 'string') {
    return content
  }
  const nested = (item as { text?: { plainText?: string; content?: string } }).text
  if (nested && typeof nested.plainText === 'string' && nested.plainText.length > 0) {
    return nested.plainText
  }
  if (nested && typeof nested.content === 'string') {
    return nested.content
  }
  return undefined
}

/**
 * Write text to all recognised fields on a widget-like object.
 */
export function writeItemText(item: Record<string, unknown>, text: string): void {
  const textItem = item as { plainText?: string; content?: string }
  if (typeof textItem.plainText === 'string') {
    textItem.plainText = text
  }
  if (typeof textItem.content === 'string') {
    textItem.content = text
  }
  const nested = (item as { text?: { plainText?: string; content?: string } }).text
  if (nested) {
    if (typeof nested.plainText === 'string') {
      nested.plainText = text
    }
    if (typeof nested.content === 'string') {
      nested.content = text
    }
  }
}

// Internal utility exports for tests
export { setStringAtPath as _setStringAtPath }
