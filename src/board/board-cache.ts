import * as log from '../logger'

import type { BoardLike, BoardQueryLike } from './types'

/**
 * Singleton cache for board data.
 *
 * Selection and widget queries are cached until explicitly cleared.
 * This reduces network requests when multiple components require the
 * same information.
 */
export class BoardCache {
  // TODO persistent cache service backing onto Redis or SQLite for multi-process reuse
  // TODO translate cached results to a simple data model shared with the server
  // TODO expose a backend lookup for selection so the client never calls
  //      board.getSelection directly.
  private selection: Array<Record<string, unknown>> | undefined
  private readonly widgets = new Map<string, Array<Record<string, unknown>>>()

  /** Store the current selection in the cache. */
  public setSelection(items: Array<Record<string, unknown>>): void {
    log.debug({ count: items.length }, 'Selection updated from event')
    this.selection = items
  }

  /** Retrieve and cache the current selection. */
  public async getSelection(board: BoardLike): Promise<Array<Record<string, unknown>>> {
    if (!this.selection) {
      log.trace('Fetching selection from board')
      if (typeof (board as { getSelection?: unknown }).getSelection !== 'function') {
        throw new Error('Miro board not available')
      }
      const raw = await board.getSelection()
      this.selection = raw.map((item) => item as Record<string, unknown>)
      log.debug({ count: this.selection.length }, 'Selection cached')
    } else {
      log.trace('Selection cache hit')
    }
    return this.selection
  }

  /** Clear the cached selection. */
  public clearSelection(): void {
    log.info('Clearing selection cache')
    this.selection = undefined
  }

  /**
   * Fetch widgets of the specified types using cached results where
   * available. Missing types are queried concurrently.
   */
  public async getWidgets(
    types: string[],
    board: BoardQueryLike,
  ): Promise<Array<Record<string, unknown>>> {
    const results: Array<Record<string, unknown>> = []
    const missing: string[] = []
    for (const t of types) {
      const cached = this.widgets.get(t)
      if (cached) {
        log.trace({ type: t, count: cached.length }, 'Widget cache hit')
        results.push(...cached)
      } else {
        missing.push(t)
      }
    }
    if (missing.length) {
      log.trace({ missing }, 'Fetching uncached widget types')
      const fetched = await Promise.all(
        missing.map(async (type) => {
          const widgets = await board.get({ type })
          return [type, widgets] as const
        }),
      )
      for (const [type, widgets] of fetched) {
        const cast = widgets.map((item) => item as Record<string, unknown>)
        this.widgets.set(type, cast)
        results.push(...cast)
      }
      log.info({ types: missing.length }, 'Cached widget query results')
    }
    return results
  }

  /** Reset all cached data. */
  public reset(): void {
    log.info('Resetting board cache')
    this.selection = undefined
    this.widgets.clear()
  }
}

/** Shared cache instance for convenience. */
export const boardCache = new BoardCache()
