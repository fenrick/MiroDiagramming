import { BoardLike } from '../src/board/board'
import { boardCache } from '../src/board/board-cache'
import { calculateSpacingOffsets } from '../src/board/spacing-layout'
import { applySpacingLayout } from '../src/board/spacing-tools'

beforeEach(() => boardCache.reset())

describe('spacing-tools', () => {
  test('calculateSpacingOffsets computes positions', () =>
    expect(calculateSpacingOffsets(3, 5)).toEqual([0, 5, 10]))

  test('applySpacingLayout spaces widgets horizontally by edges', async () => {
    const items = [
      { x: 0, y: 0, width: 10, sync: vi.fn() },
      { x: 0, y: 0, width: 20, sync: vi.fn() },
      { x: 0, y: 0, width: 10, sync: vi.fn() },
    ]
    const board: BoardLike = { getSelection: vi.fn().mockResolvedValue(items) }
    await applySpacingLayout({ axis: 'x', spacing: 5 }, board)
    expect(items.map((i) => i.x)).toEqual([0, 20, 40])
    expect(items[0].sync).toHaveBeenCalled()
  })

  test('applySpacingLayout grows widgets horizontally', async () => {
    const items = [
      { x: 0, y: 0, width: 10, sync: vi.fn() },
      { x: 30, y: 0, width: 20, sync: vi.fn() },
      { x: 60, y: 0, width: 10, sync: vi.fn() },
    ]
    const board: BoardLike = { getSelection: vi.fn().mockResolvedValue(items) }
    await applySpacingLayout({ axis: 'x', spacing: 5, mode: 'grow' }, board)
    expect(items.map((i) => i.width)).toEqual([20, 20, 20])
    expect(items.map((i) => i.x)).toEqual([5, 30, 55])
  })

  test('applySpacingLayout grows widgets vertically', async () => {
    const items = [
      { x: 0, y: 0, height: 10, sync: vi.fn() },
      { x: 0, y: 30, height: 20, sync: vi.fn() },
    ]
    const board: BoardLike = { getSelection: vi.fn().mockResolvedValue(items) }
    await applySpacingLayout({ axis: 'y', spacing: 5, mode: 'grow' }, board)
    expect(items.map((i) => i.height)).toEqual([20, 20])
    expect(items.map((i) => i.y)).toEqual([5, 30])
  })

  test('applySpacingLayout handles frames', async () => {
    const items = [
      { x: 0, y: 0, width: 30, sync: vi.fn(), type: 'frame' },
      { x: 40, y: 0, width: 10, sync: vi.fn(), type: 'shape' },
    ]
    const board: BoardLike = { getSelection: vi.fn().mockResolvedValue(items) }
    await applySpacingLayout({ axis: 'x', spacing: 5 }, board)
    expect(items.map((i) => i.x)).toEqual([0, 25])
  })

  test('applySpacingLayout skips unsupported items', async () => {
    const items = [{ x: 0, y: 0, width: 10, sync: vi.fn() }, { foo: 'bar' }]
    const board: BoardLike = { getSelection: vi.fn().mockResolvedValue(items) }
    await applySpacingLayout({ axis: 'x', spacing: 5 }, board)
    expect(items[0].x).toBe(0)
    expect(items[0].sync).toHaveBeenCalled()
  })

  test('applySpacingLayout spaces widgets vertically by edges', async () => {
    const items = [
      { x: 0, y: 0, height: 10, sync: vi.fn() },
      { x: 0, y: 0, height: 20, sync: vi.fn() },
    ]
    const board: BoardLike = { getSelection: vi.fn().mockResolvedValue(items) }
    await applySpacingLayout({ axis: 'y', spacing: 3 }, board)
    expect(items.map((i) => i.y)).toEqual([0, 18])
    expect(items[1].sync).toHaveBeenCalled()
  })

  test('applySpacingLayout returns early on empty selection', async () => {
    const board: BoardLike = { getSelection: vi.fn().mockResolvedValue([]) }
    await applySpacingLayout({ axis: 'y', spacing: 5 }, board)
    expect(board.getSelection).toHaveBeenCalled()
  })

  test('applySpacingLayout throws without board', async () =>
    await expect(applySpacingLayout({ axis: 'x', spacing: 1 })).rejects.toThrow(
      'Miro board not available',
    ))
})
