import { templateManager } from '../src/board/templates'
import { HierarchyProcessor } from '../src/core/graph/hierarchy-processor'

interface GlobalWithMiro {
  miro?: { board?: Record<string, unknown> }
}

declare const global: GlobalWithMiro

describe('HierarchyProcessor', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    delete global.miro
  })

  test('processFile loads data and delegates', async () => {
    const proc = new HierarchyProcessor()
    const spy = vi
      .spyOn(
        proc as unknown as {
          processHierarchy: (r: unknown, o?: unknown) => Promise<void>
        },
        'processHierarchy',
      )
      .mockResolvedValue()
    const file = {
      name: 'h.json',
      text: vi.fn().mockResolvedValue('[{"id":"n","label":"L","type":"Motivation"}]'),
    } as unknown as File
    await proc.processFile(file)
    expect(spy).toHaveBeenCalledWith([{ id: 'n', label: 'L', type: 'Motivation' }], {})
  })

  test('processHierarchy creates widgets and zooms', async () => {
    global.miro = {
      board: {
        get: vi.fn().mockResolvedValue([]),
        findEmptySpace: vi.fn().mockResolvedValue({ x: 0, y: 0, width: 100, height: 100 }),
        viewport: {
          get: vi.fn().mockResolvedValue({ x: 0, y: 0, width: 100, height: 100 }),
          zoomTo: vi.fn(),
        },
        createFrame: vi.fn().mockResolvedValue({ add: vi.fn(), id: 'f1' }),
      },
    }
    vi.spyOn(templateManager, 'createFromTemplate').mockResolvedValue({
      type: 'shape',
      setMetadata: vi.fn(),
      getItems: vi.fn().mockResolvedValue([]),
      sync: vi.fn(),
      id: 's1',
    } as unknown)
    const proc = new HierarchyProcessor()
    await proc.processHierarchy([{ id: 'n', label: 'L', type: 'Motivation' }])
    expect(global.miro.board.viewport.zoomTo).toHaveBeenCalled()
  })

  test('processHierarchy groups parent and children', async () => {
    global.miro = {
      board: {
        get: vi.fn().mockResolvedValue([]),
        findEmptySpace: vi.fn().mockResolvedValue({ x: 0, y: 0, width: 100, height: 100 }),
        viewport: {
          get: vi.fn().mockResolvedValue({ x: 0, y: 0, width: 100, height: 100 }),
          zoomTo: vi.fn(),
        },
        createFrame: vi.fn().mockResolvedValue({ add: vi.fn(), id: 'f1' }),
        group: vi.fn().mockResolvedValue({ id: 'g1', type: 'group' }),
      },
    } as unknown as GlobalWithMiro
    vi.spyOn(templateManager, 'createFromTemplate').mockResolvedValue({
      type: 'shape',
      setMetadata: vi.fn(),
      getItems: vi.fn().mockResolvedValue([]),
      sync: vi.fn(),
      id: 's1',
    } as unknown)
    const proc = new HierarchyProcessor()
    await proc.processHierarchy([
      {
        id: 'p',
        label: 'Parent',
        type: 'Motivation',
        children: [{ id: 'c', label: 'Child', type: 'Motivation' }],
      },
    ])
    expect((global.miro.board.group as vi.Mock).mock.calls[0][0].items.length).toBe(2)
  })
})
