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
    const text = (node as CharacterData).data
    return text.trim().length === 0
  }
  if (!(node instanceof HTMLElement)) {
    return false
  }
  if (!isTrimmableTag(node.tagName.toLowerCase())) {
    return false
  }
  const textContent = node.textContent
  return textContent.trim().length === 0
}

const removeEdgeWhitespaceNodes = (container: Element): void => {
  while (container.firstChild && isIgnorableNode(container.firstChild)) {
    container.firstChild.remove()
  }
  while (container.lastChild && isIgnorableNode(container.lastChild)) {
    container.lastChild.remove()
  }
}

const collectTextNodes = (root: Element): Text[] => {
  const nodes: Text[] = []
  const walker = root.ownerDocument.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let current = walker.nextNode()
  while (current) {
    nodes.push(current as Text)
    current = walker.nextNode()
  }
  return nodes
}

const trimEdgeNodes = (textNodes: Text[]): void => {
  const first = textNodes[0]
  const last = textNodes.at(-1)
  if (!first || !last) {
    return
  }
  if (first === last) {
    first.data = first.data.trim()
    return
  }
  first.data = first.data.trimStart()
  last.data = last.data.trimEnd()
}

const trimPlainOrRichText = (value: string): string => {
  return value.includes('<') ? trimRichText(value) : value.trim()
}

const applyTrimsToWidget = (widget: Record<string, unknown>): number => {
  const fields = getTextFields(widget)
  let trimmedFields = 0
  for (const [path, value] of fields) {
    const trimmed = trimPlainOrRichText(value)
    if (trimmed === value) continue
    setStringAtPath(widget, path, trimmed)
    trimmedFields += 1
  }
  return trimmedFields
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
    const parsedDocument = parser.parseFromString(`<div>${value}</div>`, 'text/html')
    const container = parsedDocument.body.firstElementChild
    if (!container) {
      return value.trim()
    }

    // Drop empty leading/trailing nodes like <p><br/></p>
    removeEdgeWhitespaceNodes(container)

    const textNodes = collectTextNodes(container)
    if (textNodes.length === 0) {
      return container.innerHTML.trim()
    }

    trimEdgeNodes(textNodes)

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
    if (typeof widget !== 'object') {
      continue
    }
    const trimmed = applyTrimsToWidget(widget)
    if (trimmed > 0) {
      widgetsTouched += 1
      fieldsTrimmed += trimmed
      await maybeSync(widget as Syncable)
    }
  }

  log.debug({ widgetsTouched, fieldsTrimmed }, 'Shape text trimming complete')

  return { widgetsTouched, fieldsTrimmed }
}
