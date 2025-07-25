{
  (BaseItem, Group, Shape);
}
from;
('@mirohq/websdk-types');
{
  BoardQueryLike;
}
from;
('./board');
import { boardCache } from './board-cache';

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
  cache: Map<string, BaseItem> | undefined,
  label: string,
): Promise<BaseItem | undefined> {
  log.trace({ label }, 'Searching shapes');
  let map = cache;
  if (!map) {
    log.debug('Shape cache miss');
    const shapes = (await boardCache.getWidgets(
      ['shape'],
      board,
    )) as unknown as Shape[];
    map = new Map<string, BaseItem>();
    shapes
      .filter(s => typeof s.content === 'string' && s.content.trim())
      .forEach(s => map!.set(s.content, s as BaseItem));
  }
  const result = map.get(label);
  log.debug({ found: Boolean(result) }, 'Shape search complete');
  return result;
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
  log.trace({ label }, 'Searching groups');
  const groups = (await boardCache.getWidgets(
    ['group'],
    board,
  )) as unknown as Group[];
  for (const group of groups) {
    const items = await group.getItems();
    if (!Array.isArray(items)) {
      continue;
    }
    const found = items.find(
      i =>
        typeof (i as { content?: string }).content === 'string' &&
        (i as { content?: string }).content === label,
    );
    if (found) {
      log.debug('Group found via child content');
      return group;
    }
  }
  log.debug('Group not found');
  return undefined;
}
