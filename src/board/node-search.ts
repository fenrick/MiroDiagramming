import type { BaseItem, Group, Shape } from '@mirohq/websdk-types';
import type { BoardQueryLike } from './board';

const META_KEY = 'app.miro.structgraph';

/**
 * Concurrently fetch metadata for items and return the first that matches.
 *
 * @param items - Widgets providing a `getMetadata` method.
 * @param predicate - Function testing the metadata for a match.
 * @returns The first item whose metadata satisfies the predicate or `undefined`.
 */
export async function findByMetadata<
  T extends { getMetadata: (key: string) => Promise<unknown> },
>(
  items: T[],
  predicate: (meta: unknown, item: T) => boolean,
): Promise<T | undefined> {
  const metas = await Promise.all(items.map((i) => i.getMetadata(META_KEY)));
  for (let i = 0; i < items.length; i += 1) {
    if (predicate(metas[i], items[i])) return items[i];
  }
  return undefined;
}

/**
 * Search the board for a shape matching the provided label.
 *
 * The `cache` map is populated on demand using `board.get`. Subsequent calls
 * reuse the map to avoid repeated network requests.
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
  let map = cache;
  if (!map) {
    const shapes = (await board.get({ type: 'shape' })) as unknown as Shape[];
    map = new Map<string, BaseItem>();
    shapes
      .filter((s) => typeof s.content === 'string' && s.content.trim())
      .forEach((s) => map!.set(s.content, s as BaseItem));
  }
  return map.get(label);
}

interface NodeMetadata {
  type: string;
  label: string;
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
  type: string,
  label: string,
): Promise<Group | undefined> {
  const groups = (await board.get({ type: 'group' })) as unknown as Group[];
  for (const group of groups) {
    const items = await group.getItems();
    if (!Array.isArray(items)) continue;
    const match = await findByMetadata(items as BaseItem[], (meta) => {
      const data = meta as NodeMetadata | undefined;
      return data?.type === type && data.label === label;
    });
    if (match) return group;
  }
  return undefined;
}
