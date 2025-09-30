/**
 * Helpers for working with textual fields on widgets.
 *
 * These functions normalise access to common text properties and are shared
 * across search utilities, sticky tagging and other features that read or
 * mutate widget text.
 */

function pushIfString(array: [string, string][], key: string, value: unknown): void {
  if (typeof value === 'string') {
    array.push([key, value])
  }
}

function pushNestedText(array: [string, string][], text: Record<string, unknown>): void {
  pushIfString(array, 'text.plainText', text.plainText)
  pushIfString(array, 'text.content', text.content)
}

/**
 * Extract all textual fields from a widget-like object.
 *
 * The returned array preserves the discovery order of fields such as `title`,
 * `content`, `plainText`, `description` and nested `text` properties.
 */
export function getTextFields(item: Record<string, unknown>): [string, string][] {
  const fields: [string, string][] = []
  pushIfString(fields, 'title', item.title)
  pushIfString(fields, 'content', item.content)
  pushIfString(fields, 'plainText', item.plainText)
  pushIfString(fields, 'description', item.description)
  if (typeof item.text === 'string') {
    pushIfString(fields, 'text', item.text)
  } else if (typeof item.text === 'object' && item.text !== null) {
    pushNestedText(fields, item.text as Record<string, unknown>)
  }
  return fields
}

/**
 * Retrieve a string at a dot-notated path from the given item.
 */
const TEXT_GETTERS = {
  title: (item: Record<string, unknown>) =>
    typeof (item as { title?: unknown }).title === 'string'
      ? (item as { title?: string }).title
      : undefined,
  content: (item: Record<string, unknown>) =>
    typeof (item as { content?: unknown }).content === 'string'
      ? (item as { content?: string }).content
      : undefined,
  plainText: (item: Record<string, unknown>) =>
    typeof (item as { plainText?: unknown }).plainText === 'string'
      ? (item as { plainText?: string }).plainText
      : undefined,
  description: (item: Record<string, unknown>) =>
    typeof (item as { description?: unknown }).description === 'string'
      ? (item as { description?: string }).description
      : undefined,
  text: (item: Record<string, unknown>) =>
    typeof (item as { text?: unknown }).text === 'string'
      ? (item as { text?: string }).text
      : undefined,
  'text.plainText': (item: Record<string, unknown>) => {
    const nested = (item as { text?: { plainText?: unknown } | null }).text
    if (nested !== undefined && nested !== null && typeof nested.plainText === 'string') {
      return nested.plainText
    }
  },
  'text.content': (item: Record<string, unknown>) => {
    const nested = (item as { text?: { content?: unknown } | null }).text
    if (nested !== undefined && nested !== null && typeof nested.content === 'string') {
      return nested.content
    }
  },
} as const

type TextPath = keyof typeof TEXT_GETTERS

export function getStringAtPath(item: Record<string, unknown>, path: string): string | undefined {
  if (Object.hasOwn(TEXT_GETTERS, path)) {
    const getter = TEXT_GETTERS[path as TextPath]
    return getter(item)
  }
  return undefined
}

/**
 * Set a string at a dot-notated path on the given item.
 *
 * Attempts to mutate only existing string properties and guards against
 * prototype pollution by ignoring `__proto__` and `constructor` segments.
 */
const TEXT_SETTERS: Record<TextPath, (item: Record<string, unknown>, value: string) => void> = {
  title: (item, value) => {
    if (typeof (item as { title?: unknown }).title === 'string') {
      ;(item as { title?: string }).title = value
    }
  },
  content: (item, value) => {
    if (typeof (item as { content?: unknown }).content === 'string') {
      ;(item as { content?: string }).content = value
    }
  },
  plainText: (item, value) => {
    if (typeof (item as { plainText?: unknown }).plainText === 'string') {
      ;(item as { plainText?: string }).plainText = value
    }
  },
  description: (item, value) => {
    if (typeof (item as { description?: unknown }).description === 'string') {
      ;(item as { description?: string }).description = value
    }
  },
  text: (item, value) => {
    if (typeof (item as { text?: unknown }).text === 'string') {
      ;(item as { text?: string }).text = value
    }
  },
  'text.plainText': (item, value) => {
    const nested = (item as { text?: { plainText?: unknown } | null }).text
    if (nested !== undefined && nested !== null && typeof nested.plainText === 'string') {
      ;(nested as { plainText?: string }).plainText = value
    }
  },
  'text.content': (item, value) => {
    const nested = (item as { text?: { content?: unknown } | null }).text
    if (nested !== undefined && nested !== null && typeof nested.content === 'string') {
      ;(nested as { content?: string }).content = value
    }
  },
}

export function setStringAtPath(item: Record<string, unknown>, path: string, value: string): void {
  if (Object.hasOwn(TEXT_SETTERS, path)) {
    const setter = TEXT_SETTERS[path as TextPath]
    setter(item, value)
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
  const nested = (item as { text?: { plainText?: string; content?: string } | null }).text
  if (
    nested !== undefined &&
    nested !== null &&
    typeof nested.plainText === 'string' &&
    nested.plainText.length > 0
  ) {
    return nested.plainText
  }
  if (nested !== undefined && nested !== null && typeof nested.content === 'string') {
    return nested.content
  }
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
  const nested = (item as { text?: { plainText?: string; content?: string } | null }).text
  if (nested !== undefined && nested !== null) {
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
