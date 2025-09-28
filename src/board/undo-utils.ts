import type { BaseItem, Connector, Group } from '@mirohq/websdk-types'

import { type BoardBuilder } from './board-builder'
import type { BoardEntity } from './item-types'

/**
 * Remove widgets tracked in the registry and clear the list.
 *
 * @param builder - Board builder used to remove items.
 * @param registry - Collection of widgets created in the last run.
 */
export async function undoWidgets(builder: BoardBuilder, registry: BoardEntity[]): Promise<void> {
  if (registry.length) {
    const items = registry.slice()
    await builder.removeItems(items)
    registry.length = 0
  }
}

/**
 * Sync widgets and roll back on failure.
 *
 * Delegates to {@link BoardBuilder.syncAll} but removes any created widgets
 * via {@link undoWidgets} when an error occurs. This guarantees that partial
 * updates do not remain on the board if syncing fails midway.
 *
 * @param builder - Board builder instance used for syncing and removal.
 * @param registry - Collection of widgets created during the current run.
 * @param items - Widgets that should be synced to the board.
 */
export async function syncOrUndo(
  builder: BoardBuilder,
  registry: BoardEntity[],
  items: Array<BaseItem | Group | Connector>,
): Promise<void> {
  try {
    await builder.syncAll(items)
  } catch (err) {
    await undoWidgets(builder, registry)
    throw err
  }
}
