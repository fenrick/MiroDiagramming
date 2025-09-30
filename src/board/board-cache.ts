import { LRUCache } from 'lru-cache'

import * as log from '../logger'

import type { BoardLike, BoardQueryLike } from './types'

export interface BoardWidgetSummary {
  id: string
  type?: string
  data: Record<string, unknown>
}

interface CacheSnapshot {
  selection?: BoardWidgetSummary[]
}

export interface BoardCachePersistence {
  load(boardId: string): CacheSnapshot | undefined
  save(boardId: string, snapshot: CacheSnapshot): void
  clear(boardId?: string): void
}

type SelectionLoader = (board: BoardLike) => Promise<Record<string, unknown>[]>

class InMemoryPersistence implements BoardCachePersistence {
  private readonly store = new Map<string, CacheSnapshot>()

  public load(boardId: string): CacheSnapshot | undefined {
    return this.store.get(boardId)
  }

  public save(boardId: string, snapshot: CacheSnapshot): void {
    this.store.set(boardId, snapshot)
  }

  public clear(boardId?: string): void {
    if (boardId) {
      this.store.delete(boardId)
    } else {
      this.store.clear()
    }
  }
}

class SessionStoragePersistence implements BoardCachePersistence {
  private readonly storage: Storage

  constructor(storage: Storage) {
    this.storage = storage
  }

  public load(boardId: string): CacheSnapshot | undefined {
    try {
      const raw = this.storage.getItem(SessionStoragePersistence.key(boardId))
      return raw ? (JSON.parse(raw) as CacheSnapshot) : undefined
    } catch {
      return undefined
    }
  }

  public save(boardId: string, snapshot: CacheSnapshot): void {
    try {
      this.storage.setItem(SessionStoragePersistence.key(boardId), JSON.stringify(snapshot))
    } catch (error) {
      log.error({ error: String(error) }, 'Unable to persist board cache snapshot')
    }
  }

  public clear(boardId?: string): void {
    if (boardId) {
      this.storage.removeItem(SessionStoragePersistence.key(boardId))
      return
    }
    const prefix = SessionStoragePersistence.prefix()
    const toRemove: string[] = []
    for (let index = 0; index < this.storage.length; index += 1) {
      const key = this.storage.key(index)
      if (key?.startsWith(prefix)) {
        toRemove.push(key)
      }
    }
    for (const key of toRemove) {
      this.storage.removeItem(key)
    }
  }

  private static prefix(): string {
    return 'board-cache:'
  }

  private static key(boardId: string): string {
    return `${SessionStoragePersistence.prefix()}${boardId}`
  }
}

const DEFAULT_BOARD_KEY = '__default__'

const defaultLoader: SelectionLoader = async (board: BoardLike) => {
  if (typeof (board as { getSelection?: unknown }).getSelection !== 'function') {
    throw new TypeError('Miro board not available')
  }
  const raw = await board.getSelection()
  return raw.map((item) => item as Record<string, unknown>)
}

/**
 * Singleton cache for board data with optional persistence between runs.
 *
 * Selection and widget queries are cached until explicitly cleared. The
 * selection cache can be primed from a backend loader or session storage to
 * avoid repeated round-trips to the Web SDK.
 */
export class BoardCache {
  private readonly selectionCache = new LRUCache<string, Record<string, unknown>[]>({ max: 5 })
  private readonly selectionSummaryCache = new LRUCache<string, BoardWidgetSummary[]>({ max: 10 })
  private readonly widgetCache = new LRUCache<string, Record<string, unknown>[]>({ max: 60 })
  private readonly persistence: BoardCachePersistence
  private selectionLoader: SelectionLoader

  constructor(
    persistence: BoardCachePersistence = BoardCache.createDefaultPersistence(),
    loader: SelectionLoader = defaultLoader,
  ) {
    this.persistence = persistence
    this.selectionLoader = loader
  }

  /** Override the selection loader with a backend-powered fetcher. */
  public useBackendSelection(
    fetcher: (boardId: string) => Promise<Record<string, unknown>[]>,
  ): void {
    this.selectionLoader = async (board) => fetcher(BoardCache.resolveBoardId(board))
  }

  /** Store the current selection in the cache. */
  public setSelection(items: Record<string, unknown>[], board?: BoardLike): void {
    log.debug({ count: items.length }, 'Selection updated from event')
    const key = BoardCache.resolveBoardId(board)
    const summary = items.map((item) => BoardCache.toSummary(item))
    this.selectionCache.set(key, items)
    this.selectionSummaryCache.set(key, summary)
    this.persistSelection(key, summary)
  }

  /** Retrieve and cache the current selection. */
  public async getSelection(board: BoardLike): Promise<Record<string, unknown>[]> {
    const key = BoardCache.resolveBoardId(board)
    let selection = this.selectionCache.get(key)
    if (!selection) {
      const summary = this.restoreSelectionSummary(key)
      if (summary) {
        selection = summary.map((entry) => BoardCache.fromSummary(entry))
        this.selectionSummaryCache.set(key, summary)
        this.selectionCache.set(key, selection)
      }
    }
    if (selection) {
      log.trace('Selection cache hit')
      return selection
    }
    log.trace('Fetching selection from board source')
    const raw = await this.selectionLoader(board)
    selection = raw
    const summary = raw.map((item) => BoardCache.toSummary(item))
    this.selectionCache.set(key, selection)
    this.selectionSummaryCache.set(key, summary)
    this.persistSelection(key, summary)
    log.debug({ count: selection.length }, 'Selection cached from loader')
    return selection
  }

  /** Return a serialisable summary of the cached selection. */
  public async getSelectionSummary(board: BoardLike): Promise<BoardWidgetSummary[]> {
    const key = BoardCache.resolveBoardId(board)
    let summary = this.selectionSummaryCache.get(key)
    if (!summary) {
      summary = this.restoreSelectionSummary(key)
      if (summary) {
        this.selectionSummaryCache.set(key, summary)
      }
    }
    if (!summary) {
      const selection = await this.getSelection(board)
      summary = selection.map((item) => BoardCache.toSummary(item))
      this.selectionSummaryCache.set(key, summary)
      this.persistSelection(key, summary)
    }
    return summary.map((entry) => ({ ...entry, data: { ...entry.data } }))
  }

  /** Clear the cached selection. */
  public clearSelection(board?: BoardLike): void {
    log.info('Clearing selection cache')
    const key = board ? BoardCache.resolveBoardId(board) : undefined
    if (key) {
      this.selectionCache.delete(key)
      this.selectionSummaryCache.delete(key)
      this.persistence.clear(key)
    } else {
      this.selectionCache.clear()
      this.selectionSummaryCache.clear()
      this.persistence.clear()
    }
  }

  /**
   * Fetch widgets of the specified types using cached results where
   * available. Missing types are queried concurrently.
   */
  public async getWidgets(
    types: string[],
    board: BoardQueryLike,
  ): Promise<Record<string, unknown>[]> {
    const boardId = BoardCache.resolveBoardId(board as BoardLike)
    const results: Record<string, unknown>[] = []
    const missing: string[] = []
    for (const t of types) {
      const cacheKey = BoardCache.widgetKey(boardId, t)
      const cached = this.widgetCache.get(cacheKey)
      if (cached) {
        log.trace({ type: t, count: cached.length }, 'Widget cache hit')
        results.push(...cached)
      } else {
        missing.push(t)
      }
    }
    if (missing.length > 0) {
      log.trace({ missing }, 'Fetching uncached widget types')
      const fetched = await Promise.all(
        missing.map(async (type) => {
          const widgets = await board.get({ type })
          return [type, widgets] as const
        }),
      )
      for (const [type, widgets] of fetched) {
        const cast = widgets.map((item) => item as Record<string, unknown>)
        this.widgetCache.set(BoardCache.widgetKey(boardId, type), cast)
        results.push(...cast)
      }
      log.info({ types: missing.length }, 'Cached widget query results')
    }
    return results
  }

  /** Replace cached widgets for a specific type. */
  public setWidgets(type: string, widgets: Record<string, unknown>[], board?: BoardLike): void {
    const normalised = widgets.map((item) => item)
    const boardId = BoardCache.resolveBoardId(board)
    this.widgetCache.set(BoardCache.widgetKey(boardId, type), normalised)
    log.debug({ type, count: normalised.length }, 'Widget cache manually updated')
  }

  /** Reset all cached data. */
  public reset(board?: BoardLike): void {
    log.info('Resetting board cache')
    if (board) {
      const key = BoardCache.resolveBoardId(board)
      this.selectionCache.delete(key)
      this.selectionSummaryCache.delete(key)
      this.persistence.clear(key)
      BoardCache.clearWidgetEntries(this.widgetCache, key)
    } else {
      this.selectionCache.clear()
      this.selectionSummaryCache.clear()
      this.widgetCache.clear()
      this.persistence.clear()
    }
  }

  private persistSelection(boardKey: string, summary: BoardWidgetSummary[]): void {
    this.persistence.save(boardKey, { selection: summary })
  }

  private restoreSelectionSummary(boardKey: string): BoardWidgetSummary[] | undefined {
    const snapshot = this.persistence.load(boardKey)
    if (!snapshot?.selection) {
      return undefined
    }
    log.debug({ count: snapshot.selection.length }, 'Restored selection summary from persistence')
    return snapshot.selection
  }

  private static toSummary(item: Record<string, unknown>): BoardWidgetSummary {
    const sanitized = BoardCache.objectValue(BoardCache.sanitiseValue(item))
    const id =
      BoardCache.extractId(item) ?? BoardCache.extractId(sanitized) ?? BoardCache.generateId()
    const type = BoardCache.extractType(item) ?? BoardCache.extractType(sanitized)
    const data = { ...sanitized }
    delete data.id
    delete data.type
    return {
      id,
      type: typeof type === 'string' ? type : undefined,
      data,
    }
  }

  private static fromSummary(summary: BoardWidgetSummary): Record<string, unknown> {
    const payload = BoardCache.objectValue(BoardCache.sanitiseValue(summary.data))
    return {
      ...payload,
      id: summary.id,
      ...(summary.type ? { type: summary.type } : {}),
    }
  }

  private static sanitiseValue(value: unknown, depth = 0): unknown {
    if (depth > 3) {
      return undefined
    }
    if (
      value === null ||
      typeof value === 'number' ||
      typeof value === 'string' ||
      typeof value === 'boolean'
    ) {
      return value
    }
    if (Array.isArray(value)) {
      return value.slice(0, 20).map((v) => BoardCache.sanitiseValue(v, depth + 1))
    }
    if (value && typeof value === 'object') {
      const entries = Object.entries(value as Record<string, unknown>).map(([k, v]) => [
        k,
        BoardCache.sanitiseValue(v, depth + 1),
      ])
      return Object.fromEntries(entries)
    }
    return undefined
  }

  private static extractId(item: Record<string, unknown>): string | undefined {
    const candidate = item.id
    return typeof candidate === 'string' && candidate.length > 0 ? candidate : undefined
  }

  private static extractType(item: Record<string, unknown>): string | undefined {
    const candidate = item.type
    return typeof candidate === 'string' ? candidate : undefined
  }

  private static resolveBoardId(board?: BoardLike): string {
    if (!board) {
      return DEFAULT_BOARD_KEY
    }
    const candidate = (board as { id?: unknown }).id
    return typeof candidate === 'string' && candidate.length > 0 ? candidate : DEFAULT_BOARD_KEY
  }

  private static createDefaultPersistence(): BoardCachePersistence {
    const globalWithSession = globalThis as { sessionStorage?: Storage | null }
    if (globalWithSession.sessionStorage) {
      return new SessionStoragePersistence(globalWithSession.sessionStorage)
    }

    const globalWithWindow = globalThis as { window?: { sessionStorage?: Storage | null } }
    const storage = globalWithWindow.window?.sessionStorage ?? undefined
    if (storage) {
      return new SessionStoragePersistence(storage)
    }
    return new InMemoryPersistence()
  }

  private static fallbackCounter = 0

  private static generateId(): string {
    const globalCrypto = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto
    if (globalCrypto?.randomUUID) {
      return globalCrypto.randomUUID()
    }
    BoardCache.fallbackCounter += 1
    return `cache-${String(Date.now())}-${String(BoardCache.fallbackCounter)}`
  }

  private static objectValue(value: unknown): Record<string, unknown> {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value as Record<string, unknown>
    }
    return {}
  }

  private static widgetKey(boardId: string, type: string): string {
    return `${boardId}:${type}`
  }

  private static clearWidgetEntries(
    cache: LRUCache<string, Record<string, unknown>[]>,
    boardId: string,
  ): void {
    for (const key of cache.keys()) {
      if (key.startsWith(`${boardId}:`)) {
        cache.delete(key)
      }
    }
  }
}

/** Shared cache instance for convenience. */
export const boardCache = new BoardCache()
