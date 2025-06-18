import { templateManager } from '../src/templates';

declare const global: any;

describe('createFromTemplate', () => {
  beforeEach(() => {
    global.miro = {
      board: {
        createShape: jest.fn().mockResolvedValue({
          type: 'shape',
          setMetadata: jest.fn(),
          getMetadata: jest.fn(),
          sync: jest.fn(),
          id: 's1',
        }),
        createText: jest.fn().mockResolvedValue({
          type: 'text',
          setMetadata: jest.fn(),
          getMetadata: jest.fn(),
          sync: jest.fn(),
          id: 't1',
        }),
        group: jest.fn().mockResolvedValue({
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
      'Role',
      'Label',
      0,
      0,
    );
    expect(widget.type).toBe('shape');
    const args = (global.miro.board.createShape as jest.Mock).mock.calls[0][0];
    expect(args.shape).toBe('round_rectangle');
    expect(args.style.fillColor).toBe('#FDE9D9');
    expect(global.miro.board.group).not.toHaveBeenCalled();
  });

  test('groups multiple elements', async () => {
    (templateManager as any).templates.multi = {
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

  test('creates text only widget', async () => {
    (templateManager as any).templates.textOnly = { elements: [{ text: 'T' }] };
    const widget = await templateManager.createFromTemplate(
      'textOnly',
      'Label',
      0,
      0,
    );
    expect(widget.type).toBe('text');
  });

  test('throws when template missing', async () => {
    await expect(
      templateManager.createFromTemplate('missing', 'L', 0, 0),
    ).rejects.toThrow("Template 'missing' not found");
  });
});
