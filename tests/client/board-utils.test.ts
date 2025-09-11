import { ensureBoard, forEachSelection, getFirstSelection, maybeSync } from '../src/board/board'
import { boardCache } from '../src/board/board-cache'
vi.mock('../src/ui/hooks/notifications', () => ({ showError: vi.fn() }))
import { showError } from '../src/ui/hooks/notifications'

beforeEach(() => boardCache.reset())

describe('forEachSelection', () => {
  describe('callback invocation', () =>
    test('invokes callback once per item', async () => {
      const items = [{ a: 1 }, { b: 2 }]
      const board = { getSelection: vi.fn().mockResolvedValue(items) }
      const cb = vi.fn()
      await forEachSelection(cb, board)
      expect(cb).toHaveBeenCalledTimes(items.length)
      expect(cb).toHaveBeenNthCalledWith(1, items[0])
      expect(cb).toHaveBeenNthCalledWith(2, items[1])
    }))

  describe('error propagation', () =>
    test('rejects when callback throws', async () => {
      const board = { getSelection: vi.fn().mockResolvedValue([{}]) }
      await expect(
        forEachSelection(() => {
          throw new Error('fail')
        }, board),
      ).rejects.toThrow('fail')
    }))
})

describe('maybeSync', () => {
  test('invokes sync when present', async () => {
    const item = { sync: vi.fn() }
    await maybeSync(item)
    expect(item.sync).toHaveBeenCalled()
  })

  test('resolves when sync missing', async () =>
    await expect(maybeSync({})).resolves.toBeUndefined())
})

describe('getFirstSelection', () => {
  test('returns first selected item', async () => {
    const items = [{ a: 1 }, { b: 2 }]
    const board = { getSelection: vi.fn().mockResolvedValue(items) }
    const result = await getFirstSelection(board)
    expect(result).toBe(items[0])
  })

  test('returns undefined when selection empty', async () => {
    const board = { getSelection: vi.fn().mockResolvedValue([]) }
    const result = await getFirstSelection(board)
    expect(result).toBeUndefined()
  })
})

describe('ensureBoard', () => {
  const original = (globalThis as { miro?: unknown }).miro

  afterEach(() => {
    ;(globalThis as { miro?: unknown }).miro = original
    vi.mocked(showError).mockReset()
  })

  test('returns board when available', () => {
    const board = {}
    ;(globalThis as { miro?: unknown }).miro = { board }
    expect(ensureBoard()).toBe(board)
    expect(showError).not.toHaveBeenCalled()
  })

  test('reports error when board missing', () => {
    ;(globalThis as { miro?: unknown }).miro = undefined
    expect(ensureBoard()).toBeUndefined()
    expect(showError).toHaveBeenCalled()
  })
})
