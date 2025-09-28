import * as log from '../logger'
import { showError } from '../ui/hooks/notifications'

import { boardCache } from './board-cache'
import type { BoardLike, BoardQueryLike } from './types'

export type { BoardUILike, BoardLike, BoardQueryLike } from './types'

/**
 * Resolve the active board instance.
 *
 * Returns the provided board if given, otherwise falls back to the global
 * `miro.board` reference. Throws an error when no board API is available.
 *
 * @param board - Optional board object used primarily for testing.
 * @returns The board API instance.
 */
export function getBoard(board?: BoardLike): BoardLike {
  log.trace('Resolving board instance')
  const b = board ?? globalThis.miro?.board
  if (!b) {
    throw new TypeError('Miro board not available')
  }
  log.debug('Board resolved')
  return b
}

/**
 * Retrieve a board instance capable of widget queries.
 *
 * Wraps {@link getBoard} and casts the result to include the `get` method used
 * by board search utilities.
 *
 * @param board - Optional board override that implements `get`.
 * @returns Board API exposing query capabilities.
 */
export function getBoardWithQuery(board?: BoardQueryLike): BoardQueryLike {
  log.trace('Casting board with query capabilities')
  return getBoard(board) as BoardQueryLike
}

/**
 * Ensure the Miro board API is available.
 *
 * Attempts to resolve the active board and displays a user-facing error when
 * the SDK is not present, such as when opening the app outside Miro.
 *
 * @param board - Optional board override primarily used in tests.
 * @returns The resolved board instance or `undefined` when unavailable.
 */
export function ensureBoard(board?: BoardLike): BoardLike | undefined {
  try {
    return getBoard(board)
  } catch {
    void showError('Open this app in a Miro board to use this feature.')
    return undefined
  }
}

/**
 * Fetch the first item from the current board selection.
 *
 * Convenience wrapper for {@link getBoard} that resolves the active board and
 * reads the first selected widget.
 *
 * @param board - Optional board API overriding `miro.board` for testing.
 * @returns The first selected item or `undefined` when nothing is selected.
 */
export async function getFirstSelection(
  board?: BoardLike,
): Promise<Record<string, unknown> | undefined> {
  const b = getBoard(board)
  const selection = await boardCache.getSelection(b)
  log.debug({ count: selection.length }, 'Fetched first selection')
  return selection[0] as Record<string, unknown> | undefined
}

/**
 * Invoke a callback for every selected widget.
 *
 * Abstracts the common pattern of fetching the current selection and applying
 * asynchronous updates to each item.
 *
 * @param cb - Function invoked with each selected widget.
 * @param board - Optional board API overriding `miro.board` for testing.
 */
export async function forEachSelection(
  callback: (item: Record<string, unknown>) => Promise<void> | void,
  board?: BoardLike,
): Promise<void> {
  const b = getBoard(board)
  const selection = await boardCache.getSelection(b)
  log.info({ count: selection.length }, 'Processing selection')
  await Promise.all(selection.map((item) => Promise.resolve(callback(item))))
}

/**
 * Invoke the `sync` method on a widget when available.
 *
 * Simplifies conditional sync calls across board utilities.
 */
/**
 * Widget-like type optionally exposing a `sync` method.
 */
export interface Syncable {
  /** Persist property changes to the board. */
  sync?: () => Promise<void>
}

/**
 * Invoke the `sync` method on a widget when available.
 *
 * Simplifies conditional sync calls across board utilities.
 */
export async function maybeSync(item: Syncable): Promise<void> {
  if (typeof item.sync === 'function') {
    log.trace('Syncing widget')
    await item.sync()
  }
}
