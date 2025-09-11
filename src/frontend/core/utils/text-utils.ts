/**
 * Helpers for working with textual fields on widgets.
 *
 * These functions normalise access to common text properties and are shared
 * across search utilities, sticky tagging and other features that read or
 * mutate widget text.
 */

function pushIfString(arr: Array<[string, string]>, key: string, value: unknown): void {
  if (typeof value === 'string') {
    arr.push([key, value])
  }
}

function pushNestedText(arr: Array<[string, string]>, text: Record<string, unknown>): void {
  pushIfString(arr, 'text.plainText', text.plainText)
  pushIfString(arr, 'text.content', text.content)
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
  const parts = path.split('.')
  let ref: unknown = item
  for (const p of parts) {
    if (!ref || typeof ref !== 'object') {
      return undefined
    }
    ref = (ref as Record<string, unknown>)[p]
  }
  return typeof ref === 'string' ? ref : undefined
}

/**
 * Set a string at a dot-notated path on the given item.
 *
 * Attempts to mutate only existing string properties and guards against
 * prototype pollution by ignoring `__proto__` and `constructor` segments.
 */
export function setStringAtPath(item: Record<string, unknown>, path: string, value: string): void {
  const parts = path.split('.')
  let ref: Record<string, unknown> = item
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i]!
    if (key === '__proto__' || key === 'constructor') {
      return
    }
    const next = ref[key]
    if (!next || typeof next !== 'object') {
      return
    }
    ref = next as Record<string, unknown>
  }
  const last = parts[parts.length - 1]!
  if (last === '__proto__' || last === 'constructor') {
    return
  }
  if (typeof ref[last] === 'string') {
    ref[last] = value
  }
}

/**
 * Read the primary text content from a widget-like object.
 */
export function readItemText(item: Record<string, unknown>): string | undefined {
  const text = (item as { plainText?: string }).plainText
  if (typeof text === 'string' && text.length > 0) return text
  const content = (item as { content?: string }).content
  if (typeof content === 'string') return content
  const nested = (item as { text?: { plainText?: string; content?: string } }).text
  if (nested && typeof nested.plainText === 'string' && nested.plainText.length > 0)
    return nested.plainText
  if (nested && typeof nested.content === 'string') return nested.content
  return undefined
}

/**
 * Write text to all recognised fields on a widget-like object.
 */
export function writeItemText(item: Record<string, unknown>, text: string): void {
  if (typeof (item as { plainText?: string }).plainText === 'string') {
    ;(item as { plainText?: string }).plainText = text
  }
  if (typeof (item as { content?: string }).content === 'string') {
    ;(item as { content?: string }).content = text
  }
  const nested = (item as { text?: { plainText?: string; content?: string } }).text
  if (nested) {
    if (typeof nested.plainText === 'string') nested.plainText = text
    if (typeof nested.content === 'string') nested.content = text
  }
}

// Internal utility exports for tests
export { setStringAtPath as _setStringAtPath }
