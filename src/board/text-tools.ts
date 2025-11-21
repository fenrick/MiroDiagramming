import * as log from '../logger'

import { getTextFields, setStringAtPath } from '../core/utils/text-utilities'
import { type BoardLike, ensureBoard, maybeSync, type Syncable } from './board'
import { boardCache } from './board-cache'

interface TrimResult {
  widgetsTouched: number
  fieldsTrimmed: number
}

const isTrimmableTag = (tagName: string): boolean =>
  ['p', 'br', 'span', 'strong', 'em', 'b', 'i', 'u', 's', 'a'].includes(tagName)

const isIgnorableNode = (node: Node): boolean => {
  if (node.nodeType === Node.TEXT_NODE) {
    return (node.textContent ?? '').trim().length === 0
  }
  if (!(node instanceof HTMLElement)) {
    return false
  }
  if (!isTrimmableTag(node.tagName.toLowerCase())) {
    return false
  }
  const text = node.textContent ?? ''
  return text.trim().length === 0
}

/**
 * Trim leading/trailing whitespace while preserving simple HTML markup.
 *
 * Removes empty leading/trailing nodes (including empty <p> or <br>) and
 * trims whitespace on the first and last text nodes that contain content.
 */
function trimRichText(value: string): string {
  if (!value.includes('<')) {
    return value.trim()
  }

  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(`<div>${value}</div>`, 'text/html')
    const container = doc.body.firstElementChild
    if (!container) {
      return value.trim()
    }

    // Drop empty leading/trailing nodes like <p><br/></p>
    while (container.firstChild && isIgnorableNode(container.firstChild)) {
      container.removeChild(container.firstChild)
    }
    while (container.lastChild && isIgnorableNode(container.lastChild)) {
      container.removeChild(container.lastChild)
    }

    const textNodes: Text[] = []
    const walker = doc.createTreeWalker(container, NodeFilter.SHOW_TEXT)
    let current = walker.nextNode()
    while (current) {
      textNodes.push(current as Text)
      current = walker.nextNode()
    }

    if (textNodes.length === 0) {
      return container.innerHTML.trim()
    }

    const first = textNodes[0]
    const last = textNodes[textNodes.length - 1]
    if (!first || !last) {
      return container.innerHTML.trim()
    }

    const trimStart = (text: Text): void => {
      text.textContent = (text.textContent ?? '').replace(/^\s+/, '')
    }
    const trimEnd = (text: Text): void => {
      text.textContent = (text.textContent ?? '').replace(/\s+$/, '')
    }

    if (first === last) {
      first.textContent = (first.textContent ?? '').trim()
    } else {
      trimStart(first)
      trimEnd(last)
    }

    return container.innerHTML
  } catch {
    return value.trim()
  }
}

/**
 * Remove leading and trailing whitespace from text fields on selected shapes.
 *
 * The function normalises all recognised text properties (content, plainText,
 * nested text.* fields) and syncs widgets only when changes are applied.
 */
export async function trimSelectedShapeText(board?: BoardLike): Promise<TrimResult> {
  const b = ensureBoard(board)
  if (!b) {
    return { widgetsTouched: 0, fieldsTrimmed: 0 }
  }
  const selection = await boardCache.getSelection(b)
  log.info({ count: selection.length }, 'Trimming text on selected widgets')

  let widgetsTouched = 0
  let fieldsTrimmed = 0

  for (const widget of selection) {
    const fields = getTextFields(widget)
    let changed = false
    for (const [path, value] of fields) {
      const trimmed = value.includes('<') ? trimRichText(value) : value.trim()
      if (trimmed !== value) {
        setStringAtPath(widget, path, trimmed)
        fieldsTrimmed += 1
        changed = true
      }
    }

    if (changed) {
      widgetsTouched += 1
      await maybeSync(widget as Syncable)
    }
  }

  log.debug({ widgetsTouched, fieldsTrimmed }, 'Shape text trimming complete')

  return { widgetsTouched, fieldsTrimmed }
}
