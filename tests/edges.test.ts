import { graphService } from '../src/core/graph';

// Tests for the createEdges helper covering edge reuse and hints

interface GlobalWithMiro {
  miro?: { board?: Record<string, unknown> };
}

declare const global: GlobalWithMiro;

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
          start: {},
          end: {},
        }),
      },
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
    graphService.resetBoardCache();
  });

  test('skips missing nodes', async () => {
    // When a node is missing, no connectors should be created
    const edges = [{ from: 'n1', to: 'n2' }];
    const nodeMap = { n1: { id: 'a' } } as Record<string, unknown>;
    const connectors = await graphService.createEdges(
      edges as unknown as Array<{ from: string; to: string }>,
      nodeMap,
    );
    expect(connectors).toHaveLength(0);
  });

  test('creates connectors', async () => {
    const edges = [{ from: 'n1', to: 'n2', label: 'l' }];
    const nodeMap = { n1: { id: 'a' }, n2: { id: 'b' } } as Record<
      string,
      unknown
    >;
    // A new connector should be created between the nodes
    const connectors = await graphService.createEdges(
      edges as unknown as Array<{ from: string; to: string; label?: string }>,
      nodeMap,
    );
    expect(connectors).toHaveLength(1);
    expect(global.miro.board.createConnector).toHaveBeenCalled();
    const args = (global.miro.board.createConnector as jest.Mock).mock
      .calls[0][0];
    expect(args.style).toBeDefined();
  });

  test('does not lookup existing connectors', async () => {
    const edges = [{ from: 'n1', to: 'n2' }];
    const nodeMap = { n1: { id: 'a' }, n2: { id: 'b' } } as Record<
      string,
      unknown
    >;
    const connectors = await graphService.createEdges(
      edges as unknown as Array<{ from: string; to: string }>,
      nodeMap,
    );
    expect(connectors).toHaveLength(1);
    expect(global.miro.board.get).not.toHaveBeenCalled();
    expect(global.miro.board.createConnector).toHaveBeenCalled();
  });

  test('creates connectors with hint positions', async () => {
    const edges = [{ from: 'n1', to: 'n2' }];
    const nodeMap = { n1: { id: 'a' }, n2: { id: 'b' } } as Record<
      string,
      unknown
    >;
    const hint = {
      startPosition: { x: 0.1, y: 0.2 },
      endPosition: { x: 0.9, y: 1 },
    };
    await graphService.createEdges(
      edges as unknown as Array<{ from: string; to: string }>,
      nodeMap,
      [hint as unknown],
    );
    const args = (global.miro.board.createConnector as jest.Mock).mock
      .calls[0][0];
    expect(args.start.position).toEqual(hint.startPosition);
    expect(args.end.position).toEqual(hint.endPosition);
  });

  test('creates connector captions when label provided', async () => {
    const edges = [{ from: 'n1', to: 'n2', label: 'L' }];
    const nodeMap = { n1: { id: 'a' }, n2: { id: 'b' } } as Record<
      string,
      unknown
    >;
    await graphService.createEdges(
      edges as unknown as Array<{ from: string; to: string; label?: string }>,
      nodeMap,
    );
    const args = (global.miro.board.createConnector as jest.Mock).mock
      .calls[0][0];
    expect(args.captions?.[0].content).toBe('L');
  });
});
