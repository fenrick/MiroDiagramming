import { boardCache } from '../src/board/board-cache'
import {
  applySizeToSelection,
  copySizeFromSelection,
  scaleSelection,
} from '../src/board/resize-tools'

describe('resize-tools', () => {
  beforeEach(() => boardCache.reset())
  test('copySizeFromSelection returns size', async () => {
    const board = {
      getSelection: vi.fn().mockResolvedValue([{ width: 5, height: 6 }]),
    }
    const size = await copySizeFromSelection(board)
    expect(size).toEqual({ width: 5, height: 6 })
  })

  test('applySizeToSelection updates widgets', async () => {
    const item = { width: 1, height: 1, sync: vi.fn() }
    const board = { getSelection: vi.fn().mockResolvedValue([item]) }
    await applySizeToSelection({ width: 10, height: 20 }, board)
    expect(item.width).toBe(10)
    expect(item.height).toBe(20)
    expect(item.sync).toHaveBeenCalled()
  })

  test('applySizeToSelection updates frames', async () => {
    const item = { width: 30, height: 40, sync: vi.fn(), type: 'frame' }
    const board = { getSelection: vi.fn().mockResolvedValue([item]) }
    await applySizeToSelection({ width: 50, height: 60 }, board)
    expect(item.width).toBe(50)
    expect(item.height).toBe(60)
  })

  test('applySizeToSelection skips unsupported items', async () => {
    const items = [{ width: 1, height: 1, sync: vi.fn() }, { foo: 'bar' }]
    const board = { getSelection: vi.fn().mockResolvedValue(items) }
    await applySizeToSelection({ width: 5, height: 5 }, board)
    expect(items[0].width).toBe(5)
    expect(items[1]).toEqual({ foo: 'bar' })
  })

  test('copySizeFromSelection returns null when invalid', async () => {
    const board = { getSelection: vi.fn().mockResolvedValue([{}]) }
    const size = await copySizeFromSelection(board)
    expect(size).toBeNull()
  })

  test('applySizeToSelection throws without board', async () =>
    await expect(applySizeToSelection({ width: 1, height: 1 })).rejects.toThrow(
      'Miro board not available',
    ))

  test('scaleSelection multiplies widget dimensions', async () => {
    const item = { width: 10, height: 5, sync: vi.fn() }
    const board = { getSelection: vi.fn().mockResolvedValue([item]) }
    await scaleSelection(2, board)
    expect(item.width).toBe(20)
    expect(item.height).toBe(10)
    expect(item.sync).toHaveBeenCalled()
  })

  test('scaleSelection ignores unsupported items', async () => {
    const items = [{ width: 4, height: 4, sync: vi.fn() }, { foo: 'bar' }]
    const board = { getSelection: vi.fn().mockResolvedValue(items) }
    await scaleSelection(0.5, board)
    expect(items[0].width).toBe(2)
    expect(items[0].height).toBe(2)
    expect(items[1]).toEqual({ foo: 'bar' })
  })
})
