import { templateManager } from 'fenrick.miro.ux/board/templates';

interface GlobalWithMiro {
  miro?: { board?: Record<string, unknown> };
}

declare const global: GlobalWithMiro;

describe('createFromTemplate', () => {
  beforeEach(() => {
    global.miro = {
      board: {
        createShape: jest
          .fn()
          .mockResolvedValue({
            type: 'shape',
            setMetadata: jest.fn(),
            getMetadata: jest.fn(),
            sync: jest.fn(),
            id: 's1',
          }),
        createText: jest
          .fn()
          .mockResolvedValue({
            type: 'text',
            setMetadata: jest.fn(),
            getMetadata: jest.fn(),
            sync: jest.fn(),
            id: 't1',
          }),
        group: jest
          .fn()
          .mockResolvedValue({
            type: 'group',
            getItems: jest.fn().mockResolvedValue([]),
            setMetadata: jest.fn(),
            sync: jest.fn(),
            id: 'g1',
          }),
      },
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('creates a single shape with correct style', async () => {
    const widget = await templateManager.createFromTemplate(
      'Motivation',
      'Label',
      0,
      0,
    );
    expect(widget.type).toBe('shape');
    const args = (global.miro.board.createShape as jest.Mock).mock.calls[0][0];
    expect(args.shape).toBe('round_rectangle');
    expect(args.style.fillColor).toBe('#B5A9FF');
    expect(global.miro.board.group).not.toHaveBeenCalled();
  });

  test('groups multiple elements', async () => {
    (
      templateManager as unknown as { templates: Record<string, unknown> }
    ).templates.multi = {
      elements: [
        { shape: 'rectangle', width: 50, height: 50 },
        { text: 'test' },
      ],
    };
    const widget = await templateManager.createFromTemplate(
      'multi',
      'Label',
      0,
      0,
    );
    expect(widget.type).toBe('group');
    expect(global.miro.board.createShape).toHaveBeenCalled();
    expect(global.miro.board.createText).toHaveBeenCalled();
    const items = (global.miro.board.group as jest.Mock).mock.calls[0][0].items;
    expect(items).toHaveLength(2);
  });

  test('adds created items to provided frame', async () => {
    (
      templateManager as unknown as { templates: Record<string, unknown> }
    ).templates.withFrame = {
      elements: [
        { shape: 'rectangle', width: 20, height: 20 },
        { text: 'Frame' },
      ],
    };
    const frame = {
      add: jest.fn(),
    } as unknown as import('@mirohq/websdk-types').Frame;
    const widget = await templateManager.createFromTemplate(
      'withFrame',
      'L',
      0,
      0,
      frame,
    );
    expect(frame.add).toHaveBeenCalledTimes(2);
    expect(widget.type).toBe('group');
  });

  test('creates text only widget', async () => {
    (
      templateManager as unknown as { templates: Record<string, unknown> }
    ).templates.textOnly = { elements: [{ text: 'T' }] };
    const widget = await templateManager.createFromTemplate(
      'textOnly',
      'Label',
      0,
      0,
    );
    expect(widget.type).toBe('text');
  });

  test('single element added to frame without grouping', async () => {
    (
      templateManager as unknown as { templates: Record<string, unknown> }
    ).templates.frameSingle = {
      elements: [{ shape: 'ellipse', width: 10, height: 10 }],
    };
    const frame = {
      add: jest.fn(),
    } as unknown as import('@mirohq/websdk-types').Frame;
    const widget = await templateManager.createFromTemplate(
      'frameSingle',
      'L',
      0,
      0,
      frame,
    );
    expect(frame.add).toHaveBeenCalledTimes(1);
    expect(global.miro.board.group).not.toHaveBeenCalled();
    expect(widget.type).toBe('shape');
  });

  test('apply fill property when style lacks fillColor', async () => {
    (
      templateManager as unknown as { templates: Record<string, unknown> }
    ).templates.fillStyle = {
      elements: [{ shape: 'rect', fill: '#fff', style: {} }],
    };
    const widget = await templateManager.createFromTemplate(
      'fillStyle',
      'L',
      0,
      0,
    );
    const args = (
      global.miro.board.createShape as jest.Mock
    ).mock.calls.pop()[0];
    expect(args.style.fillColor).toBe('#fff');
    expect(widget.type).toBe('shape');
  });

  test('ignores unsupported element types', async () => {
    (
      templateManager as unknown as { templates: Record<string, unknown> }
    ).templates.unknownElement = { elements: [{ position: 'top' }] };
    const widget = await templateManager.createFromTemplate(
      'unknownElement',
      'L',
      0,
      0,
    );
    expect(widget).toBeUndefined();
  });

  test('throws when template missing', async () => {
    await expect(
      templateManager.createFromTemplate('missing', 'L', 0, 0),
    ).rejects.toThrow("Template 'missing' not found");
  });
});
