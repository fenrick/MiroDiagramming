import {
  BoardQueryLike,
  getBoardWithQuery,
  maybeSync,
  Syncable,
} from './board';
import { boardCache } from './board-cache';
import safeRegex from 'safe-regex';

/** Search configuration. */
export interface SearchOptions {
  /** Text to search for. */
  query: string;
  /** Require exact case match. */
  caseSensitive?: boolean;
  /** Match whole words only. */
  wholeWord?: boolean;
  /** Treat query as regular expression. */
  regex?: boolean;
  /** Restrict search to specific widget types. */
  widgetTypes?: string[];
  /** Only include widgets tagged with one of these IDs. */
  tagIds?: string[];
  /** Restrict by exact background or fill colour. */
  backgroundColor?: string;
  /** Filter by assignee ID. */
  assignee?: string;
  /** Filter by creator ID. */
  creator?: string;
  /** Filter by last modifier ID. */
  lastModifiedBy?: string;
  /** Limit search to the current selection. */
  inSelection?: boolean;
}

/** Result describing the matching widget and field. */
export interface SearchResult {
  /** Widget that matched. */
  item: Record<string, unknown>;
  /** Property path containing the text. */
  field: string;
}

/** Options for replacing board content. */
export interface ReplaceOptions extends SearchOptions {
  /** Replacement text. */
  replacement: string;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
function assertRegexSafe(pattern: string): void {
  const repeatedGroup = /\((\w)\1+\+\)/.test(pattern);
  const nestedQuantifier = /\(.+[+*].+\)[+*?]/.test(pattern);
  if (!safeRegex(pattern) || repeatedGroup || nestedQuantifier) {
    throw new SyntaxError('Unsafe regular expression');
  }
}

function buildRegex(opts: SearchOptions): RegExp {
  const src = opts.regex ? opts.query : escapeRegExp(opts.query);
  if (src.length > 200) {
    throw new SyntaxError('Pattern too long');
  }
  const pattern = opts.wholeWord ? `\\b${src}\\b` : src;
  assertRegexSafe(pattern);
  const flags = opts.caseSensitive ? 'g' : 'gi';
  return new RegExp(pattern, flags);
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
function pushIfString(
  arr: Array<[string, string]>,
  key: string,
  value: unknown,
): void {
  if (typeof value === 'string') {
    arr.push([key, value]);
  }
}

function pushNestedText(
  arr: Array<[string, string]>,
  text: Record<string, unknown>,
): void {
  pushIfString(arr, 'text.plainText', text.plainText);
  pushIfString(arr, 'text.content', text.content);
}

export function getTextFields(
  item: Record<string, unknown>,
): Array<[string, string]> {
  const fields: Array<[string, string]> = [];
  pushIfString(fields, 'title', item.title);
  pushIfString(fields, 'content', item.content);
  pushIfString(fields, 'plainText', item.plainText);
  pushIfString(fields, 'description', item.description);
  if (typeof item.text === 'string') {
    pushIfString(fields, 'text', item.text);
  } else if (item.text && typeof item.text === 'object') {
    pushNestedText(fields, item.text as Record<string, unknown>);
  }
  return fields;
}

function getStringAtPath(
  item: Record<string, unknown>,
  path: string,
): string | undefined {
  const parts = path.split('.');
  let ref: unknown = item;
  for (const p of parts) {
    if (!ref || typeof ref !== 'object') {
      return undefined;
    }
    ref = (ref as Record<string, unknown>)[p];
  }
  return typeof ref === 'string' ? ref : undefined;
}

function isUnsafe(prop: string): boolean {
  return prop === '__proto__' || prop === 'constructor';
}

function getParent(
  obj: Record<string, unknown>,
  parts: string[],
): Record<string, unknown> | undefined {
  let ref: unknown = obj;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const part = parts[i];
    if (isUnsafe(part) || !ref || typeof ref !== 'object') {
      return undefined;
    }
    ref = (ref as Record<string, unknown>)[part];
  }
  return typeof ref === 'object' && ref
    ? (ref as Record<string, unknown>)
    : undefined;
}

function setStringAtPath(
  item: Record<string, unknown>,
  path: string,
  value: string,
): void {
  const parts = path.split('.');
  const parent = getParent(item, parts);
  if (!parent) {
    return;
  }
  const last = parts[parts.length - 1];
  if (isUnsafe(last)) {
    return;
  }
  parent[last] = value;
}

/**
 * Collect matching text fields from a single widget.
 */
function collectMatches(
  item: Record<string, unknown>,
  pattern: RegExp,
): SearchResult[] {
  const matches: SearchResult[] = [];
  for (const [field, text] of getTextFields(item)) {
    pattern.lastIndex = 0;
    if (pattern.test(text)) {
      matches.push({ item, field });
    }
  }
  return matches;
}

/**
 * Retrieve candidate widgets from the board based on type and selection.
 */
async function queryBoardItems(
  opts: SearchOptions,
  board: BoardQueryLike,
): Promise<Record<string, unknown>[]> {
  if (opts.inSelection) {
    return boardCache.getSelection(board);
  }
  const types = opts.widgetTypes?.length ? opts.widgetTypes : ['widget'];
  return boardCache.getWidgets(types, board);
}

/**
 * Create a predicate that evaluates search filters on a widget.
 *
 * Each option in {@link SearchOptions} corresponds to a simple check. The
 * returned function returns `true` only when all configured checks succeed.
 */
function buildFilter(
  opts: SearchOptions,
): (item: Record<string, unknown>) => boolean {
  const checks: Array<(i: Record<string, unknown>) => boolean> = [];

  if (opts.widgetTypes) {
    const types = new Set(opts.widgetTypes);
    checks.push(i => types.has((i as { type?: string }).type ?? ''));
  }

  if (opts.tagIds) {
    const tagsWanted = new Set(opts.tagIds);
    checks.push(i => {
      const tags = (i as { tagIds?: string[] }).tagIds;
      return Array.isArray(tags) && tags.some(id => tagsWanted.has(id));
    });
  }

  if (opts.backgroundColor) {
    const colour = opts.backgroundColor.toLowerCase();
    checks.push(i => {
      const style = (i.style ?? {}) as Record<string, unknown>;
      const fill = (style.fillColor ?? style.backgroundColor) as
        | string
        | undefined;
      return typeof fill === 'string' && fill.toLowerCase() === colour;
    });
  }

  if (opts.assignee) {
    const assigneeId = opts.assignee;
    checks.push(i => {
      const assignee =
        (i as { assignee?: string; assigneeId?: string }).assignee ??
        (i as { assigneeId?: string }).assigneeId;
      return assignee === assigneeId;
    });
  }

  if (opts.creator) {
    const creator = opts.creator;
    checks.push(i => (i as { createdBy?: string }).createdBy === creator);
  }

  if (opts.lastModifiedBy) {
    const modifier = opts.lastModifiedBy;
    checks.push(
      i => (i as { lastModifiedBy?: string }).lastModifiedBy === modifier,
    );
  }
  return (item: Record<string, unknown>) => checks.every(fn => fn(item));
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
  opts: SearchOptions,
  board?: BoardQueryLike,
): Promise<SearchResult[]> {
  const b = getBoardWithQuery(board);
  const items = await queryBoardItems(opts, b);
  const filter = buildFilter(opts);
  const pattern = buildRegex(opts);
  const results: SearchResult[] = [];
  for (const item of items) {
    if (!filter(item)) {
      continue;
    }
    results.push(...collectMatches(item, pattern));
  }
  return results;
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
  opts: ReplaceOptions,
  board?: BoardQueryLike,
  onMatch?: (item: Record<string, unknown>) => Promise<void> | void,
): Promise<number> {
  const b = getBoardWithQuery(board);
  const matches = await searchBoardContent(opts, b);
  const pattern = buildRegex(opts);
  let count = 0;
  for (const { item, field } of matches) {
    if (onMatch) {
      await onMatch(item);
    }
    const current = getStringAtPath(item, field);
    if (current === undefined) {
      continue;
    }
    const updated = current.replace(pattern, () => {
      count += 1;
      return opts.replacement;
    });
    if (updated !== current) {
      setStringAtPath(item, field, updated);
      await maybeSync(item as Syncable);
    }
  }
  return count;
}

// Internal export for testing.
export { setStringAtPath as _setStringAtPath };
