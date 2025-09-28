import type { BaseItem, Group } from '@mirohq/websdk-types'
import { LRUCache } from 'lru-cache'

import * as log from '../logger'

import type { BoardQueryLike } from './board'
import { boardCache } from './board-cache'

/**
 * Search the board for a shape matching the provided label.
 *
 * The `cache` map is populated on demand using {@link boardCache.getWidgets}.
 * Subsequent calls reuse the map to avoid repeated network requests.
 *
 * @param board - Board API used to query widgets.
 * @param cache - Map keyed by shape text content.
 * @param label - Text displayed on the shape to search for.
 * @returns The matching widget or `undefined`.
 */
export async function searchShapes(
  board: BoardQueryLike,
  cache: LRUCache<string, BaseItem> | undefined,
  label: string,
): Promise<BaseItem | undefined> {
  log.trace({ label }, 'Searching shapes')
  let map = cache
  if (!map) {
    log.debug('Shape cache miss')
    const widgets = await boardCache.getWidgets(['shape'], board)
    map = new LRUCache<string, BaseItem>({ max: 500 })
    for (const s of widgets) {
      const content = (s as { content?: unknown }).content
      if (typeof content === 'string' && content.trim()) {
        map.set(content, s as BaseItem)
      }
    }
  }
  const result = map.get(label)
  log.debug({ found: Boolean(result) }, 'Shape search complete')
  return result
}

/**
 * Search all board groups for one containing an item with matching metadata.
 *
 * @param board - Board API used to query groups.
 * @param type - Node type stored in metadata.
 * @param label - Node label stored in metadata.
 * @returns The matching group or `undefined`.
 */
export async function searchGroups(
  board: BoardQueryLike,
  _type: string,
  label: string,
): Promise<Group | undefined> {
  log.trace({ label }, 'Searching groups')
  const groups = await boardCache.getWidgets(['group'], board)
  for (const group of groups) {
    if (typeof (group as { getItems?: unknown }).getItems !== 'function') {
      continue
    }

    const groupItem = group as unknown as Group
    const items = await groupItem.getItems()
    if (!Array.isArray(items)) {
      continue
    }
    const found = items.find(
      (index) =>
        typeof (index as { content?: string }).content === 'string' &&
        (index as { content?: string }).content === label,
    )
    if (found) {
      log.debug('Group found via child content')
      return groupItem
    }
  }
  log.debug('Group not found')
  return undefined
}
