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
          id: 'c1'
        })
      }
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
    const args = (global.miro.board.createConnector as jest.Mock).mock.calls[0][0];
    expect(args.style).toBeDefined();
  });

  test('reuses existing connectors when metadata matches', async () => {
    (global.miro.board.get as jest.Mock).mockResolvedValueOnce([
      {
        getMetadata: jest.fn().mockResolvedValue({ from: 'n1', to: 'n2' }),
        sync: jest.fn(),
        id: 'cExisting'
      }
    ]);
    const edges = [{ from: 'n1', to: 'n2' }];
    const nodeMap = { n1: { id: 'a' }, n2: { id: 'b' } } as any;
    const connectors = await createEdges(edges as any, nodeMap);
    expect(connectors).toHaveLength(1);
    expect(global.miro.board.createConnector).not.toHaveBeenCalled();
  });
});
