/**
 * Diff calculation between two collections of items. Each item must have an
 * optional `id` property used to determine identity.
 */
export interface DiffResult<T> {
  /** Items that do not exist in the original set. */
  readonly creates: T[]
  /** Items present in both sets but with different content. */
  readonly updates: T[]
  /** Items from the original set missing in the modified set. */
  readonly deletes: T[]
}

/**
 * Compute additions, updates and deletions between two arrays.
 *
 * @param original - Baseline items.
 * @param modified - New items to compare against the baseline.
 * @returns A {@link DiffResult} categorising changes.
 */
export function computeDiff<T extends { id?: string }>(
  original: readonly T[],
  modified: readonly T[],
): DiffResult<T> {
  const originalMap = new Map(original.map((item) => [item.id ?? crypto.randomUUID(), item]))
  const modifiedMap = new Map(modified.map((item) => [item.id ?? crypto.randomUUID(), item]))

  const creates = modified.filter((item) => {
    if (!item.id) {
      return true
    }
    return !originalMap.has(item.id)
  })

  const deletes = original.filter((item) => {
    if (!item.id) {
      return true
    }
    return !modifiedMap.has(item.id)
  })

  const updates = modified.filter((item) => {
    if (!item.id) {
      return false
    }
    const orig = originalMap.get(item.id)
    if (!orig) {
      return false
    }
    return JSON.stringify(orig) !== JSON.stringify(item)
  })

  return { creates, updates, deletes }
}
