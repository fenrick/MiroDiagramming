import { BoardBuilder } from '../src/board/BoardBuilder';

interface GlobalWithMiro {
  miro?: { board: Record<string, unknown> };
}

declare const global: GlobalWithMiro;

/**
 * Additional tests exercising caching and connector styling logic.
 */

describe('BoardBuilder caches and connector updates', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    delete global.miro;
  });

  test('findNode retrieves shape from cache', async () => {
    const shape = {
      getMetadata: jest.fn().mockResolvedValue({ type: 'Role', label: 'B' }),
    } as Record<string, unknown>;
    global.miro = { board: { get: jest.fn().mockResolvedValue([shape]) } };
    const builder = new BoardBuilder();
    const result = await builder.findNode('Role', 'B');
    expect(result).toBe(shape);
  });

  test('createEdges caches new connector', async () => {
    const board = {
      get: jest.fn().mockResolvedValue([]),
      createConnector: jest
        .fn()
        .mockResolvedValue({
          setMetadata: jest.fn(),
          getMetadata: jest.fn(),
          sync: jest.fn(),
          id: 'c1',
        }),
    };
    global.miro = { board };
    const builder = new BoardBuilder();
    const edges = [{ from: 'n1', to: 'n2' }];
    const nodeMap = { n1: { id: 'a' }, n2: { id: 'b' } } as Record<
      string,
      unknown
    >;

    await builder.createEdges(
      edges as unknown as Array<{ from: string; to: string }>,
      nodeMap,
    );
    const calls = board.get.mock.calls.length;
    await builder.findConnector('n1', 'n2');
    expect(board.get.mock.calls.length).toBe(calls);
  });

  test('updateConnector merges style from template', async () => {
    const existing = {
      getMetadata: jest.fn().mockResolvedValue({ from: 'n1', to: 'n2' }),
      sync: jest.fn(),
      id: 'cExisting',
      style: {},
    } as Record<string, unknown>;
    const board = {
      get: jest.fn().mockResolvedValueOnce([existing]),
      createConnector: jest.fn(),
    };
    global.miro = { board };
    const builder = new BoardBuilder();
    const edges = [{ from: 'n1', to: 'n2', metadata: { template: 'flow' } }];
    const nodeMap = { n1: { id: 'a' }, n2: { id: 'b' } } as Record<
      string,
      unknown
    >;

    await builder.createEdges(
      edges as unknown as Array<{
        from: string;
        to: string;
        metadata: { template: string };
      }>,
      nodeMap,
    );
    expect(existing.style.strokeStyle).toBe('dashed');
  });
});
