import { graphService } from 'fenrick.miro.ux/core/graph';
import { templateManager } from 'fenrick.miro.ux/board/templates';

interface GlobalWithMiro {
  miro?: { board?: Record<string, unknown> };
}

declare const global: GlobalWithMiro;

describe('createNode', () => {
  beforeEach(() => {
    global.miro = { board: { get: jest.fn().mockResolvedValue([]) } };
    jest
      .spyOn(templateManager, 'createFromTemplate')
      .mockResolvedValue({
        type: 'shape',
        setMetadata: jest.fn(),
        getMetadata: jest.fn(),
        getItems: jest.fn().mockResolvedValue([]),
        sync: jest.fn(),
        id: 's1',
      } as unknown as { type: string; setMetadata: jest.Mock } & Record<
        string,
        unknown
      >);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    graphService.resetBoardCache();
  });

  const node = { id: 'n1', label: 'L', type: 'Motivation' } as Record<
    string,
    unknown
  >;
  const pos = { x: 0, y: 0, width: 10, height: 10 };

  test('creates new node', async () => {
    const result = await graphService.createNode(node, pos);
    expect(result).toBeDefined();
  });

  test('ignores existing node', async () => {
    const existing = {
      type: 'shape',
      style: {},
      setMetadata: jest.fn(),
      getMetadata: jest
        .fn()
        .mockResolvedValue({ type: 'Motivation', label: 'L' }),
      sync: jest.fn(),
      id: 'sExisting',
    } as Record<string, unknown>;
    (global.miro.board.get as jest.Mock).mockResolvedValueOnce([existing]);
    const result = await graphService.createNode(node, pos);
    expect(result).not.toBe(existing);
  });
});
