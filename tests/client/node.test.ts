import { templateManager } from '../src/board/templates';
import { graphService } from '../src/core/graph';

interface GlobalWithMiro {
  miro?: { board?: Record<string, unknown> };
}

declare const global: GlobalWithMiro;

describe('createNode', () => {
  beforeEach(() => {
    global.miro = { board: { get: vi.fn().mockResolvedValue([]) } };
    vi.spyOn(templateManager, 'createFromTemplate').mockResolvedValue({
      type: 'shape',
      setMetadata: vi.fn(),
      getMetadata: vi.fn(),
      getItems: vi.fn().mockResolvedValue([]),
      sync: vi.fn(),
      id: 's1',
    } as unknown as { type: string; setMetadata: vi.Mock } & Record<
      string,
      unknown
    >);
  });

  afterEach(() => {
    vi.restoreAllMocks();
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
      setMetadata: vi.fn(),
      getMetadata: vi
        .fn()
        .mockResolvedValue({ type: 'Motivation', label: 'L' }),
      sync: vi.fn(),
      id: 'sExisting',
    } as Record<string, unknown>;
    (global.miro.board.get as vi.Mock).mockResolvedValueOnce([existing]);
    const result = await graphService.createNode(node, pos);
    expect(result).not.toBe(existing);
  });
});
