import { templateManager } from '../src/board/templates'
import { ShapeClient } from '../src/core/utils/shape-client'

interface GlobalWithMiro {
  miro?: { board?: Record<string, unknown> }
}

declare const global: GlobalWithMiro

describe('createFromTemplate', () => {
  beforeEach(() => {
    global.miro = {
      board: {
        get: vi.fn(),
        group: vi.fn().mockResolvedValue({
          type: 'group',
          getItems: vi.fn().mockResolvedValue([]),
          setMetadata: vi.fn(),
          sync: vi.fn(),
          id: 'g1',
        }),
      },
    } as unknown as GlobalWithMiro['miro']
    vi.spyOn(ShapeClient.prototype, 'createShapes').mockResolvedValue([{ id: 's1' }])
    ;(global.miro.board.get as vi.Mock).mockResolvedValue([
      {
        type: 'shape',
        setMetadata: vi.fn(),
        getMetadata: vi.fn(),
        sync: vi.fn(),
        id: 's1',
      },
    ])
  })

  afterEach(() => vi.restoreAllMocks())

  test('creates a single shape with correct style', async () => {
    const widget = await templateManager.createFromTemplate('Motivation', 'Label', 0, 0)
    expect(widget.type).toBe('shape')
    const args = (ShapeClient.prototype.createShapes as vi.Mock).mock.calls[0][0][0]
    expect(args.shape).toBe('round_rectangle')
    expect(args.style.fillColor).toBe('#B5A9FF')
    expect(global.miro.board.group).not.toHaveBeenCalled()
  })

  test('groups multiple elements', async () => {
    ;(templateManager as unknown as { templates: Record<string, unknown> }).templates.multi = {
      elements: [{ shape: 'rectangle', width: 50, height: 50 }, { text: 'test' }],
    }
    ;(ShapeClient.prototype.createShapes as vi.Mock).mockResolvedValue([{ id: 's1' }, { id: 't1' }])
    ;(global.miro.board.get as vi.Mock)
      .mockResolvedValueOnce([
        {
          type: 'shape',
          setMetadata: vi.fn(),
          getMetadata: vi.fn(),
          sync: vi.fn(),
          id: 's1',
        },
      ])
      .mockResolvedValueOnce([
        {
          type: 'text',
          setMetadata: vi.fn(),
          getMetadata: vi.fn(),
          sync: vi.fn(),
          id: 't1',
        },
      ])
    const widget = await templateManager.createFromTemplate('multi', 'Label', 0, 0)
    expect(widget.type).toBe('group')
    expect(ShapeClient.prototype.createShapes).toHaveBeenCalled()
    const items = (global.miro.board.group as vi.Mock).mock.calls[0][0].items
    expect(items).toHaveLength(2)
  })

  test('adds created items to provided frame', async () => {
    ;(templateManager as unknown as { templates: Record<string, unknown> }).templates.withFrame = {
      elements: [{ shape: 'rectangle', width: 20, height: 20 }, { text: 'Frame' }],
    }
    const frame = {
      add: vi.fn(),
    } as unknown as import('@mirohq/websdk-types').Frame
    ;(ShapeClient.prototype.createShapes as vi.Mock).mockResolvedValue([{ id: 's1' }, { id: 't1' }])
    ;(global.miro.board.get as vi.Mock)
      .mockResolvedValueOnce([{ type: 'shape', id: 's1', setMetadata: vi.fn(), sync: vi.fn() }])
      .mockResolvedValueOnce([{ type: 'text', id: 't1', setMetadata: vi.fn(), sync: vi.fn() }])
    const widget = await templateManager.createFromTemplate('withFrame', 'L', 0, 0, frame)
    expect(frame.add).toHaveBeenCalledTimes(2)
    expect(widget.type).toBe('group')
  })

  test('creates text only widget', async () => {
    ;(templateManager as unknown as { templates: Record<string, unknown> }).templates.textOnly = {
      elements: [{ text: 'T' }],
    }
    ;(ShapeClient.prototype.createShapes as vi.Mock).mockResolvedValue([{ id: 't1' }])
    ;(global.miro.board.get as vi.Mock).mockResolvedValueOnce([
      { type: 'text', id: 't1', setMetadata: vi.fn(), sync: vi.fn() },
    ])
    const widget = await templateManager.createFromTemplate('textOnly', 'Label', 0, 0)
    expect(widget.type).toBe('text')
  })

  test('single element added to frame without grouping', async () => {
    ;(templateManager as unknown as { templates: Record<string, unknown> }).templates.frameSingle =
      {
        elements: [{ shape: 'ellipse', width: 10, height: 10 }],
      }
    const frame = {
      add: vi.fn(),
    } as unknown as import('@mirohq/websdk-types').Frame
    ;(ShapeClient.prototype.createShapes as vi.Mock).mockResolvedValue([{ id: 's1' }])
    ;(global.miro.board.get as vi.Mock).mockResolvedValueOnce([
      { type: 'shape', id: 's1', setMetadata: vi.fn(), sync: vi.fn() },
    ])
    const widget = await templateManager.createFromTemplate('frameSingle', 'L', 0, 0, frame)
    expect(frame.add).toHaveBeenCalledTimes(1)
    expect(global.miro.board.group).not.toHaveBeenCalled()
    expect(widget.type).toBe('shape')
  })

  test('apply fill property when style lacks fillColor', async () => {
    ;(templateManager as unknown as { templates: Record<string, unknown> }).templates.fillStyle = {
      elements: [{ shape: 'rect', fill: '#fff', style: {} }],
    }
    ;(ShapeClient.prototype.createShapes as vi.Mock).mockResolvedValue([{ id: 's1' }])
    ;(global.miro.board.get as vi.Mock).mockResolvedValueOnce([
      { type: 'shape', id: 's1', setMetadata: vi.fn(), sync: vi.fn() },
    ])
    const widget = await templateManager.createFromTemplate('fillStyle', 'L', 0, 0)
    const args = (ShapeClient.prototype.createShapes as vi.Mock).mock.calls.pop()[0][0]
    expect(args.style.fillColor).toBe('#fff')
    expect(widget.type).toBe('shape')
  })

  test('ignores unsupported element types', async () => {
    ;(
      templateManager as unknown as { templates: Record<string, unknown> }
    ).templates.unknownElement = { elements: [{ position: 'top' }] }
    const widget = await templateManager.createFromTemplate('unknownElement', 'L', 0, 0)
    expect(widget).toBeUndefined()
  })

  test('throws when template missing', async () =>
    await expect(templateManager.createFromTemplate('missing', 'L', 0, 0)).rejects.toThrow(
      "Template 'missing' not found",
    ))
})
