import { createEdges, resetBoardCache } from '../src/graph';

declare const global: any;

describe('createEdges', () => {
  beforeEach(() => {
    global.miro = {
      board: {
        get: jest.fn().mockResolvedValue([]),
        createConnector: jest.fn().mockResolvedValue({
          setMetadata: jest.fn(),
          getMetadata: jest.fn(),
          sync: jest.fn(),
          id: 'c1',
        }),
      },
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
    resetBoardCache();
  });

  test('skips missing nodes', async () => {
    const edges = [{ from: 'n1', to: 'n2' }];
    const nodeMap = { n1: { id: 'a' } } as any;
    const connectors = await createEdges(edges as any, nodeMap);
    expect(connectors).toHaveLength(0);
  });

  test('creates connectors', async () => {
    const edges = [{ from: 'n1', to: 'n2', label: 'l' }];
    const nodeMap = { n1: { id: 'a' }, n2: { id: 'b' } } as any;
    const connectors = await createEdges(edges as any, nodeMap);
    expect(connectors).toHaveLength(1);
    expect(global.miro.board.createConnector).toHaveBeenCalled();
    const args = (global.miro.board.createConnector as jest.Mock).mock
      .calls[0][0];
    expect(args.style).toBeDefined();
  });

  test('reuses existing connectors when metadata matches', async () => {
    (global.miro.board.get as jest.Mock).mockResolvedValueOnce([
      {
        getMetadata: jest.fn().mockResolvedValue({ from: 'n1', to: 'n2' }),
        sync: jest.fn(),
        id: 'cExisting',
      },
    ]);
    const edges = [{ from: 'n1', to: 'n2' }];
    const nodeMap = { n1: { id: 'a' }, n2: { id: 'b' } } as any;
    const connectors = await createEdges(edges as any, nodeMap);
    expect(connectors).toHaveLength(1);
    expect(global.miro.board.createConnector).not.toHaveBeenCalled();
  });

  test('updates reused connectors with hint positions', async () => {
    const existing = {
      getMetadata: jest.fn().mockResolvedValue({ from: 'n1', to: 'n2' }),
      sync: jest.fn(),
      id: 'cExisting',
      start: { item: 'a', position: { x: 0, y: 0 } },
      end: { item: 'b', position: { x: 0, y: 0 } },
    };
    (global.miro.board.get as jest.Mock).mockResolvedValueOnce([existing]);
    const edges = [{ from: 'n1', to: 'n2' }];
    const nodeMap = { n1: { id: 'a' }, n2: { id: 'b' } } as any;
    const hint = {
      startPosition: { x: 0.1, y: 0.2 },
      endPosition: { x: 0.9, y: 1 },
    };
    const connectors = await createEdges(edges as any, nodeMap, [hint as any]);
    expect(connectors[0]).toBe(existing);
    expect(existing.start.position).toEqual(hint.startPosition);
    expect(existing.end.position).toEqual(hint.endPosition);
  });

  test('updateConnector sets caption when label provided', async () => {
    const existing = {
      getMetadata: jest.fn().mockResolvedValue({ from: 'n1', to: 'n2' }),
      sync: jest.fn(),
      id: 'cExisting',
    } as any;
    (global.miro.board.get as jest.Mock).mockResolvedValueOnce([existing]);
    const edges = [{ from: 'n1', to: 'n2', label: 'L' }];
    const nodeMap = { n1: { id: 'a' }, n2: { id: 'b' } } as any;
    const connectors = await createEdges(edges as any, nodeMap);
    expect(connectors[0]).toBe(existing);
    expect(existing.captions[0].content).toBe('L');
  });
});
