import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { renameSelectedFrames, lockSelectedFrames } from '../../src/board/frame-tools'
import { boardCache } from '../../src/board/board-cache'

describe('frame-tools', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    boardCache.reset()
  })

  it('renames frames left-to-right, top-to-bottom', async () => {
    const frames = [
      { type: 'frame', x: 10, y: 0, title: '' },
      { type: 'frame', x: 0, y: 10, title: '' },
      { type: 'frame', x: 0, y: 0, title: '' },
    ]
    vi.spyOn(boardCache, 'getSelection').mockResolvedValue(frames as any)
    await renameSelectedFrames({ prefix: 'F-' }, {} as any)
    const titlesInOrder = [...frames].sort((a, b) => a.x! - b.x! || a.y! - b.y!).map((f) => f.title)
    expect(titlesInOrder).toEqual(['F-0', 'F-1', 'F-2'])
  })

  it('locks frames and their children', async () => {
    const childA = { locked: false, sync: vi.fn().mockResolvedValue(undefined) }
    const childB = { locked: false, sync: vi.fn().mockResolvedValue(undefined) }
    const frames = [
      {
        type: 'frame',
        locked: false,
        sync: vi.fn().mockResolvedValue(undefined),
        getChildren: vi.fn().mockResolvedValue([childA, childB]),
      },
    ]
    vi.spyOn(boardCache, 'getSelection').mockResolvedValue(frames as any)
    await lockSelectedFrames({} as any)
    expect(frames[0]!.locked).toBe(true)
    expect(childA.locked).toBe(true)
    expect(childB.locked).toBe(true)
  })
})
