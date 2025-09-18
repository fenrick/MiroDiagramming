import type { BoardLike } from './board'

/**
 * Execute multiple board operations within a batch transaction when supported.
 *
 * Falls back to sequential execution if batching methods are unavailable.
 *
 * @param board - Miro board API instance.
 * @param fn - Callback containing board operations to perform.
 * @returns Result of the callback.
 */
export async function runBatch<T>(board: BoardLike, fn: () => Promise<T>): Promise<T> {
  if (typeof board.startBatch === 'function') {
    await board.startBatch()
    try {
      const result = await fn()
      await board.endBatch?.()
      return result
    } catch (err) {
      await board.abortBatch?.()
      throw err
    }
  }
  return fn()
}
