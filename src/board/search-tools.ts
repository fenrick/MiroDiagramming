import safeRegex from 'safe-regex'

import { getTextFields, getStringAtPath, setStringAtPath } from '../core/utils/text-utilities'

import { type BoardQueryLike, getBoardWithQuery, maybeSync, type Syncable } from './board'
import { boardCache } from './board-cache'

/** Search configuration. */
export interface SearchOptions {
  /** Text to search for. */
  query: string
  /** Require exact case match. */
  caseSensitive?: boolean
  /** Match whole words only. */
  wholeWord?: boolean
  /** Treat query as regular expression. */
  regex?: boolean
  /** Restrict search to specific widget types. */
  widgetTypes?: string[]
  /** Only include widgets tagged with one of these IDs. */
  tagIds?: string[]
  /** Restrict by exact background or fill colour. */
  backgroundColor?: string
  /** Filter by assignee ID. */
  assignee?: string
  /** Filter by creator ID. */
  creator?: string
  /** Filter by last modifier ID. */
  lastModifiedBy?: string
  /** Limit search to the current selection. */
  inSelection?: boolean
}

/** Result describing the matching widget and field. */
export interface SearchResult {
  /** Widget that matched. */
  item: Record<string, unknown>
  /** Property path containing the text. */
  field: string
}

/** Options for replacing board content. */
export interface ReplaceOptions extends SearchOptions {
  /** Replacement text. */
  replacement: string
}

function escapeRegExp(string_: string): string {
  return string_.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`)
}

/**
 * Ensure the regular expression is reasonably safe.
 *
 * The heuristics block known backtracking patterns like `(aa+)` and nested
 * quantifiers which `safe-regex` alone does not catch.
 *
 * @param pattern - Source string of the regular expression.
 * @throws {SyntaxError} If the pattern appears unsafe.
 */
function assertRegexSafe(pattern: string, _flags: string): void {
  const repeatedGroup = /\((?:[^)\s]|\\.){1,8}\)(?:\+{2,}|\*{2,})/.test(pattern)
  const nestedQuantifier = /\([^)]{0,128}[+*][^)]{0,128}\)[+*?]/.test(pattern)
  // Pass a string to safe-regex to avoid constructing a dynamic RegExp here.
  if (!safeRegex(pattern) || repeatedGroup || nestedQuantifier) {
    throw new SyntaxError('Unsafe regular expression')
  }
}

function buildRegex(options: SearchOptions): RegExp {
  const source = options.regex ? options.query : escapeRegExp(options.query)
  if (source.length > 200) {
    throw new SyntaxError('Pattern too long')
  }
  const pattern = options.wholeWord ? `\\b${source}\\b` : source
  const flags = options.caseSensitive ? 'g' : 'gi'
  assertRegexSafe(pattern, flags)
  // eslint-disable-next-line security/detect-non-literal-regexp -- pattern validated by assertRegexSafe.
  return new RegExp(pattern, flags)
}

/**
 * Extract all textual fields from a widget-like object.
 *
 * The function inspects common properties such as `title`, `content`,
 * `plainText` and `description`. When a `text` object is present nested
 * strings are also included. The returned array preserves the discovery
 * order of the fields.
 *
 * @param item - Record containing arbitrary widget properties.
 * @returns Array of `[path, text]` tuples for each discovered field.
 */
/**
 * Collect matching text fields from a single widget.
 */
function collectMatches(item: Record<string, unknown>, pattern: RegExp): SearchResult[] {
  const matches: SearchResult[] = []
  for (const [field, text] of getTextFields(item)) {
    pattern.lastIndex = 0
    if (pattern.test(text)) {
      matches.push({ item, field })
    }
  }
  return matches
}

/**
 * Retrieve candidate widgets from the board based on type and selection.
 */
async function queryBoardItems(
  options: SearchOptions,
  board: BoardQueryLike,
): Promise<Record<string, unknown>[]> {
  if (options.inSelection) {
    return boardCache.getSelection(board)
  }
  const types = options.widgetTypes?.length ? options.widgetTypes : ['widget']
  return boardCache.getWidgets(types, board)
}

/**
 * Create a predicate that evaluates search filters on a widget.
 *
 * Each option in {@link SearchOptions} corresponds to a simple check. The
 * returned function returns `true` only when all configured checks succeed.
 */
function buildFilter(options: SearchOptions): (item: Record<string, unknown>) => boolean {
  const checks: ((index: Record<string, unknown>) => boolean)[] = []

  if (options.widgetTypes) {
    const types = new Set(options.widgetTypes)
    checks.push((index) => types.has((index as { type?: string }).type ?? ''))
  }

  if (options.tagIds) {
    const tagsWanted = new Set(options.tagIds)
    checks.push((index) => {
      const tags = (index as { tagIds?: string[] }).tagIds
      return Array.isArray(tags) && tags.some((id) => tagsWanted.has(id))
    })
  }

  if (options.backgroundColor) {
    const colour = options.backgroundColor.toLowerCase()
    checks.push((index) => {
      const style = (index.style ?? {}) as Record<string, unknown>
      const fill = (style.fillColor ?? style.backgroundColor) as string | undefined
      return typeof fill === 'string' && fill.toLowerCase() === colour
    })
  }

  if (options.assignee) {
    const assigneeId = options.assignee
    checks.push((index) => {
      const assignee =
        (index as { assignee?: string; assigneeId?: string }).assignee ??
        (index as { assigneeId?: string }).assigneeId
      return assignee === assigneeId
    })
  }

  if (options.creator) {
    const creator = options.creator
    checks.push((index) => (index as { createdBy?: string }).createdBy === creator)
  }

  if (options.lastModifiedBy) {
    const modifier = options.lastModifiedBy
    checks.push((index) => (index as { lastModifiedBy?: string }).lastModifiedBy === modifier)
  }
  return (item: Record<string, unknown>) => checks.every((function_) => function_(item))
}

/**
 * Search widgets on the board for text matching a pattern.
 *
 * @param opts - Criteria controlling the search behaviour and filters. When
 *   `opts.regex` is `true`, {@link SearchOptions.query} is interpreted as a
 *   regular expression.
 * @param board - Optional board API override primarily used for testing.
 * @returns Array of matches where each element contains the widget and the
 *   field that matched.
 * @throws If {@link SearchOptions.query} is an invalid regular expression when
 *   `opts.regex` is enabled.
 */
export async function searchBoardContent(
  options: SearchOptions,
  board?: BoardQueryLike,
): Promise<SearchResult[]> {
  const b = getBoardWithQuery(board)
  const items = await queryBoardItems(options, b)
  const filter = buildFilter(options)
  const pattern = buildRegex(options)
  const results: SearchResult[] = []
  for (const item of items) {
    if (!filter(item)) {
      continue
    }
    results.push(...collectMatches(item, pattern))
  }
  return results
}

/**
 * Replace text in widgets matched by {@link searchBoardContent}.
 *
 * @param opts - Options describing the search and replacement text. If
 *   `opts.regex` is enabled and {@link SearchOptions.query} is not a valid
 *   regular expression an exception will be thrown.
 * @param board - Optional board API override used mainly for testing.
 * @param onMatch - Callback invoked for each matched widget before the
 *   replacement is applied. This can be used to focus the board on the item or
 *   perform additional side effects.
 * @returns The number of replacements that were made.
 * @throws If {@link SearchOptions.query} is an invalid regular expression when
 *   `opts.regex` is set.
 */
export async function replaceBoardContent(
  options: ReplaceOptions,
  board?: BoardQueryLike,
  onMatch?: (item: Record<string, unknown>) => Promise<void> | void,
): Promise<number> {
  const b = getBoardWithQuery(board)
  const matches = await searchBoardContent(options, b)
  const pattern = buildRegex(options)
  let count = 0
  for (const { item, field } of matches) {
    if (onMatch) {
      await onMatch(item)
    }
    const current = getStringAtPath(item, field)
    if (current === undefined) {
      continue
    }
    const updated = current.replace(pattern, () => {
      count += 1
      return options.replacement
    })
    if (updated !== current) {
      setStringAtPath(item, field, updated)
      await maybeSync(item as Syncable)
    }
  }
  return count
}

// Internal export for testing.
