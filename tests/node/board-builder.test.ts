import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('../../src/board/node-search', () => ({
  searchShapes: vi.fn(),
  searchGroups: vi.fn(),
}))
vi.mock('../../src/board/connector-utils', () => ({
  createConnector: vi.fn(),
  updateConnector: vi.fn(),
}))
vi.mock('../../src/board/templates', () => ({
  templateManager: {
    getTemplate: vi
      .fn()
      .mockReturnValue({ elements: [{ shape: 'rectangle', width: 10, height: 10 }] }),
    createFromTemplate: vi.fn().mockResolvedValue({ id: 'new-shape', width: 0, height: 0 }),
    getConnectorTemplate: vi.fn().mockReturnValue({ style: { strokeColor: '#000' } }),
  },
}))

import { searchGroups, searchShapes } from '../../src/board/node-search'
import { createConnector } from '../../src/board/connector-utils'
import { BoardBuilder } from '../../src/board/board-builder'
import { boardCache } from '../../src/board/board-cache'

describe('BoardBuilder', () => {
  beforeAll(() => {
    ;(globalThis as any).miro = { board: { ui: {}, viewport: {}, group: vi.fn() } }
  })
  beforeEach(() => {
    vi.clearAllMocks()
  })
  afterEach(() => {
    boardCache.reset()
  })

  it('findNode validates params and falls back from shapes to groups', async () => {
    const builder = new BoardBuilder()
    await expect(
      builder.findNode(123 as any, 'X' as any, { get: vi.fn() } as any),
    ).rejects.toThrow()
    ;(searchShapes as unknown as jest.Mock).mockResolvedValue(undefined)
    vi.spyOn(boardCache, 'getWidgets').mockResolvedValue([] as any)
    const group = { id: 'g' }
    ;(searchGroups as unknown as jest.Mock).mockResolvedValue(group)
    const res = await builder.findNode('type', 'label', { get: vi.fn() } as any)
    expect(res).toBe(group)
  })

  it('findNodeInSelection searches only selection', async () => {
    const builder = new BoardBuilder()
    vi.spyOn(boardCache, 'getSelection').mockResolvedValue([
      { id: 's', type: 'shape', content: 'L' },
    ] as any)
    ;(searchShapes as unknown as jest.Mock).mockResolvedValue({ id: 's' })
    const found = await builder.findNodeInSelection('type', 'L')
    expect(found).toEqual({ id: 's' })
  })

  it('createEdges creates connectors and logs failures', async () => {
    const builder = new BoardBuilder()
    ;(createConnector as unknown as jest.Mock)
      .mockResolvedValueOnce({ id: 'c1' })
      .mockRejectedValueOnce(new Error('bad'))
    const edges = [
      { id: 'e1', from: 'a', to: 'b', metadata: { template: 'flow' } },
      { id: 'e2', from: 'a', to: 'b' },
    ] as any
    const nodeMap = { a: { id: 'A' }, b: { id: 'B' } } as any
    const conns = await builder.createEdges(edges, nodeMap)
    expect(conns.length).toBe(1)
    expect(conns[0]!.id).toBe('c1')
  })

  it('resizeItem sets width and height', async () => {
    const builder = new BoardBuilder()
    const item: any = { width: 1, height: 2 }
    await builder.resizeItem(item, 10, 20)
    expect(item.width).toBe(10)
    expect(item.height).toBe(20)
  })

  it('findSpace uses viewport and findEmptySpace', async () => {
    const builder = new BoardBuilder()
    const mockVp = { x: 100, y: 200, width: 300, height: 400 }
    ;(globalThis as any).miro.board.viewport.get = vi.fn().mockResolvedValue(mockVp)
    ;(globalThis as any).miro.board.findEmptySpace = vi.fn().mockResolvedValue({ x: 123, y: 456 })
    const spot = await builder.findSpace(200, 100)
    expect(spot).toEqual({ x: 123, y: 456 })
    expect((globalThis as any).miro.board.findEmptySpace).toHaveBeenCalled()
  })

  it('createFrame stores frame and getFrame returns it', async () => {
    const builder = new BoardBuilder()
    const frame = { id: 'frame-1' }
    ;(globalThis as any).miro.board.createFrame = vi.fn().mockResolvedValue(frame)
    const created = await builder.createFrame(100, 50, 0, 0, 'T')
    expect(created).toBe(frame)
    expect(builder.getFrame()).toBe(frame)
  })

  it('zoomTo delegates to viewport.zoomTo', async () => {
    const builder = new BoardBuilder()
    const target = { id: 'frame' } as any
    ;(globalThis as any).miro.board.viewport.zoomTo = vi.fn().mockResolvedValue(undefined)
    await builder.zoomTo(target)
    expect((globalThis as any).miro.board.viewport.zoomTo).toHaveBeenCalledWith(target)
  })

  it('syncAll invokes sync on items that support it', async () => {
    const builder = new BoardBuilder()
    const a = { sync: vi.fn().mockResolvedValue(undefined) }
    const b = {} // no sync
    ;(globalThis as any).miro.board = { ...(globalThis as any).miro.board }
    await builder.syncAll([a as any, b as any])
    expect(a.sync).toHaveBeenCalled()
  })

  it('createNode throws when template missing', async () => {
    const builder = new BoardBuilder()
    // Override templateManager mock to simulate missing template
    const tm = await import('../../src/board/templates')
    const spy = vi.spyOn(tm.templateManager, 'getTemplate').mockReturnValue(undefined as any)
    await expect(
      builder.createNode({ id: 'n', type: 'Nope', label: 'X' } as any, {
        x: 0,
        y: 0,
        width: 10,
        height: 10,
      }),
    ).rejects.toThrow(/Template 'Nope' not found/)
    spy.mockRestore()
  })

  it('createNode creates widget via template and resizes it', async () => {
    const builder = new BoardBuilder()
    const tm = await import('../../src/board/templates')
    const createFromTemplateSpy = vi
      .spyOn(tm.templateManager, 'createFromTemplate')
      .mockResolvedValue({ id: 'w1', width: 0, height: 0 } as any)
    const getTemplateSpy = vi
      .spyOn(tm.templateManager, 'getTemplate')
      .mockReturnValue({ elements: [{ shape: 'rectangle' }] } as any)
    const resizeSpy = vi.spyOn(builder as any, 'resizeItem')
    const widget = await builder.createNode({ id: 'n1', type: 'T', label: 'L' } as any, {
      x: 10,
      y: 20,
      width: 30,
      height: 40,
    })
    expect(widget).toMatchObject({ id: 'w1' })
    expect(createFromTemplateSpy).toHaveBeenCalled()
    expect(getTemplateSpy).toHaveBeenCalled()
    expect(resizeSpy).toHaveBeenCalledWith(expect.any(Object), 30, 40)
    createFromTemplateSpy.mockRestore()
    getTemplateSpy.mockRestore()
  })
})
