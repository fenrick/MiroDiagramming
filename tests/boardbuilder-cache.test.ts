import { BoardBuilder } from '../src/BoardBuilder';

/**
 * Additional tests exercising caching and connector styling logic.
 */

describe('BoardBuilder caches and connector updates', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    delete (global as any).miro;
  });

  test('findNode retrieves shape from cache', async () => {
    const shape = {
      getMetadata: jest.fn().mockResolvedValue({ type: 'Role', label: 'B' }),
    } as any;
    (global as any).miro = {
      board: { get: jest.fn().mockResolvedValue([shape]) },
    };
    const builder = new BoardBuilder();
    const res = await builder.findNode('Role', 'B');
    expect(res).toBe(shape);
  });

  test('createEdges caches new connector', async () => {
    const board = {
      get: jest.fn().mockResolvedValue([]),
      createConnector: jest.fn().mockResolvedValue({
        setMetadata: jest.fn(),
        getMetadata: jest.fn(),
        sync: jest.fn(),
        id: 'c1',
      }),
    };
    (global as any).miro = { board };
    const builder = new BoardBuilder();
    const edges = [{ from: 'n1', to: 'n2' }];
    const nodeMap = { n1: { id: 'a' }, n2: { id: 'b' } } as any;

    await builder.createEdges(edges as any, nodeMap);
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
    } as any;
    const board = {
      get: jest.fn().mockResolvedValueOnce([existing]),
      createConnector: jest.fn(),
    };
    (global as any).miro = { board };
    const builder = new BoardBuilder();
    const edges = [{ from: 'n1', to: 'n2', metadata: { template: 'flow' } }];
    const nodeMap = { n1: { id: 'a' }, n2: { id: 'b' } } as any;

    await builder.createEdges(edges as any, nodeMap);
    expect(existing.style.strokeStyle).toBe('dashed');
  });
});
