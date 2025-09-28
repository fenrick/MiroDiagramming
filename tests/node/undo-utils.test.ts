import { describe, it, expect, vi } from 'vitest'

import { syncOrUndo, undoWidgets } from '../../src/board/undo-utilities'

describe('undo-utils', () => {
  it('undoWidgets removes items and clears registry', async () => {
    const removed: any[] = []
    const builder = {
      removeItems: vi.fn(async (items: any[]) => removed.push(...items)),
    } as any
    const registry = [{ id: 'a' }, { id: 'b' }] as any[]
    await undoWidgets(builder, registry)
    expect(removed.map((i) => i.id)).toEqual(['a', 'b'])
    expect(registry.length).toBe(0)
  })

  it('syncOrUndo undoes on sync failure', async () => {
    const builder = {
      syncAll: vi.fn(async () => {
        throw new Error('boom')
      }),
      removeItems: vi.fn(async () => {}),
    } as any
    const registry = [{ id: 'x' }] as any[]
    await expect(syncOrUndo(builder, registry, [{ id: 'z' }] as any[])).rejects.toThrow()
    // Registry is cleared due to undo
    expect(registry.length).toBe(0)
  })
})
