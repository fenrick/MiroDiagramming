import { BoardBuilder, updateConnector } from '../src/board/board-builder';

interface GlobalWithMiro {
  miro?: { board: Record<string, unknown> };
}

declare const global: GlobalWithMiro;

/**
 * Additional tests exercising lookup and connector styling logic.
 */

describe('BoardBuilder lookup and connector updates', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    delete global.miro;
  });

  test('findNode caches shapes by text', async () => {
    const shape = { content: 'B' } as Record<string, unknown>;
    global.miro = { board: { get: jest.fn().mockResolvedValue([shape]) } };
    const builder = new BoardBuilder();
    await builder.findNode('Role', 'B');
    await builder.findNode('Role', 'B');
    expect((global.miro.board.get as jest.Mock).mock.calls.length).toBe(1);
  });

  test('reset clears the shape cache', async () => {
    const shape = { content: 'B' } as Record<string, unknown>;
    global.miro = { board: { get: jest.fn().mockResolvedValue([shape]) } };
    const builder = new BoardBuilder();
    await builder.findNode('Role', 'B');
    builder.reset();
    await builder.findNode('Role', 'B');
    expect((global.miro.board.get as jest.Mock).mock.calls.length).toBe(2);
  });

  test('lookup matches shape text regardless of metadata', async () => {
    const shape = {
      content: 'A',
      getMetadata: jest.fn().mockResolvedValue({ type: 'X', label: 'Y' }),
    } as Record<string, unknown>;
    global.miro = { board: { get: jest.fn().mockResolvedValue([shape]) } };
    const builder = new BoardBuilder();
    const result = await builder.findNode('Role', 'A');
    expect(result).toBe(shape);
  });

  test('createEdges skips connector lookup', async () => {
    const board = {
      get: jest.fn(),
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
    expect(board.get).not.toHaveBeenCalled();
  });

  test('updateConnector merges style from template', () => {
    const existing = { style: {} } as Record<string, unknown>;
    updateConnector(
      existing as unknown as Connector,
      {
        from: 'n1',
        to: 'n2',
      } as unknown as import('../src/core/graph').EdgeData,
      { shape: 'curved', style: { strokeStyle: 'dashed' } },
      undefined,
    );
    expect(existing.style.strokeStyle).toBe('dashed');
  });
});
