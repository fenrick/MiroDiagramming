import {
  getBoardWithQuery,
  BoardQueryLike,
  maybeSync,
  Syncable,
} from './board';

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

function buildRegex(opts: SearchOptions): RegExp {
  const src = opts.regex ? opts.query : escapeRegExp(opts.query);
  const pattern = opts.wholeWord ? `\\b${src}\\b` : src;
  const flags = opts.caseSensitive ? 'g' : 'gi';
  return new RegExp(pattern, flags);
}

function getTextFields(item: Record<string, unknown>): Array<[string, string]> {
  const fields: Array<[string, string]> = [];
  if (typeof item.title === 'string') fields.push(['title', item.title]);
  if (typeof item.content === 'string') fields.push(['content', item.content]);
  if (typeof item.plainText === 'string')
    fields.push(['plainText', item.plainText]);
  if (typeof item.description === 'string')
    fields.push(['description', item.description]);
  if (typeof item.text === 'string') fields.push(['text', item.text]);
  else if (item.text && typeof item.text === 'object') {
    const txt = item.text as Record<string, unknown>;
    if (typeof txt.plainText === 'string')
      fields.push(['text.plainText', txt.plainText]);
    if (typeof txt.content === 'string')
      fields.push(['text.content', txt.content]);
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
    if (!ref || typeof ref !== 'object') return undefined;
    ref = (ref as Record<string, unknown>)[p];
  }
  return typeof ref === 'string' ? ref : undefined;
}

function setStringAtPath(
  item: Record<string, unknown>,
  path: string,
  value: string,
): void {
  const parts = path.split('.');
  let ref: unknown = item;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const part = parts[i];
    // Prevent prototype pollution by aborting on unsafe property names.
    if (part === '__proto__' || part === 'constructor') return;
    if (!ref || typeof ref !== 'object') return;
    ref = (ref as Record<string, unknown>)[part];
  }
  const last = parts[parts.length - 1];
  if (last === '__proto__' || last === 'constructor') return;
  if (ref && typeof ref === 'object') {
    (ref as Record<string, unknown>)[last] = value;
  }
}

function applyFilters(
  item: Record<string, unknown>,
  opts: SearchOptions,
): boolean {
  const filters = [
    opts.widgetTypes &&
      ((i: Record<string, unknown>) =>
        opts.widgetTypes!.includes((i as { type?: string }).type ?? '')),
    opts.tagIds &&
      ((i: Record<string, unknown>) => {
        const tags = (i as { tagIds?: string[] }).tagIds;
        return (
          Array.isArray(tags) && opts.tagIds!.some((id) => tags.includes(id))
        );
      }),
    opts.backgroundColor &&
      ((i: Record<string, unknown>) => {
        const style = (i.style ?? {}) as Record<string, unknown>;
        const fill = (style.fillColor ?? style.backgroundColor) as
          | string
          | undefined;
        return (
          typeof fill === 'string' &&
          fill.toLowerCase() === opts.backgroundColor!.toLowerCase()
        );
      }),
    opts.assignee &&
      ((i: Record<string, unknown>) => {
        const assignee =
          (i as { assignee?: string; assigneeId?: string }).assignee ??
          (i as { assigneeId?: string }).assigneeId;
        return assignee === opts.assignee;
      }),
    opts.creator &&
      ((i: Record<string, unknown>) =>
        (i as { createdBy?: string }).createdBy === opts.creator),
    opts.lastModifiedBy &&
      ((i: Record<string, unknown>) =>
        (i as { lastModifiedBy?: string }).lastModifiedBy ===
        opts.lastModifiedBy),
  ].filter(Boolean) as Array<(i: Record<string, unknown>) => boolean>;
  return filters.every((fn) => fn(item));
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
  let items: Record<string, unknown>[] = [];
  if (opts.inSelection) {
    items = await b.getSelection();
  } else {
    const types = opts.widgetTypes?.length ? opts.widgetTypes : ['widget'];
    for (const t of types) items.push(...(await b.get({ type: t })));
  }
  const pattern = buildRegex(opts);
  const results: SearchResult[] = [];
  for (const item of items) {
    if (!applyFilters(item, opts)) continue;
    for (const [field, text] of getTextFields(item)) {
      pattern.lastIndex = 0;
      if (pattern.test(text)) results.push({ item, field });
    }
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
    if (onMatch) await onMatch(item);
    const current = getStringAtPath(item, field);
    if (current === undefined) continue;
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
