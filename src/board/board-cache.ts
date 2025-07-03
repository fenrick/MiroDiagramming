import { BoardLike, BoardQueryLike, getBoardWithQuery } from './board';

/**
 * Singleton cache for board data.
 *
 * Selection and widget queries are cached until explicitly cleared.
 * This reduces network requests when multiple components require the
 * same information.
 */
export class BoardCache {
  private selection: Array<Record<string, unknown>> | undefined;
  private readonly widgets = new Map<string, Array<Record<string, unknown>>>();

  /** Retrieve and cache the current selection. */
  public async getSelection(
    board?: BoardLike,
  ): Promise<Array<Record<string, unknown>>> {
    if (!this.selection) {
      const b = getBoardWithQuery(board as BoardQueryLike);
      this.selection = await b.getSelection();
    }
    return this.selection;
  }

  /** Clear the cached selection. */
  public clearSelection(): void {
    this.selection = undefined;
  }

  /**
   * Fetch widgets of the specified types using cached results where
   * available. Missing types are queried concurrently.
   */
  public async getWidgets(
    types: string[],
    board?: BoardQueryLike,
  ): Promise<Array<Record<string, unknown>>> {
    const b = getBoardWithQuery(board);
    const results: Array<Record<string, unknown>> = [];
    const missing: string[] = [];
    for (const t of types) {
      const cached = this.widgets.get(t);
      if (cached) results.push(...cached);
      else missing.push(t);
    }
    if (missing.length) {
      const fetched = await Promise.all(missing.map((t) => b.get({ type: t })));
      for (let i = 0; i < missing.length; i += 1) {
        const list = fetched[i] as Array<Record<string, unknown>>;
        this.widgets.set(missing[i], list);
        results.push(...list);
      }
    }
    return results;
  }

  /** Reset all cached data. */
  public reset(): void {
    this.selection = undefined;
    this.widgets.clear();
  }
}

/** Shared cache instance for convenience. */
export const boardCache = new BoardCache();
