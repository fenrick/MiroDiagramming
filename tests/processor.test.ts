import { GraphProcessor } from '../src/GraphProcessor';
import { resetBoardCache } from '../src/graph';
import * as templateModule from '../src/templates';
import sample from '../sample-graph.json';

declare const global: any;

describe('GraphProcessor', () => {
  const processor = new GraphProcessor();

  beforeEach(() => {
    global.miro = {
      board: {
        get: jest.fn().mockResolvedValue([]),
        findEmptySpace: jest.fn().mockResolvedValue({
          x: 0,
          y: 0,
          width: 100,
          height: 100,
        }),
        viewport: {
          get: jest.fn().mockResolvedValue({
            x: 0,
            y: 0,
            width: 1000,
            height: 1000,
          }),
          set: jest.fn().mockResolvedValue({}),
          zoomTo: jest.fn(),
        },
        createConnector: jest.fn().mockResolvedValue({
          setMetadata: jest.fn(),
          getMetadata: jest.fn(),
          sync: jest.fn(),
          id: 'c1',
        }),
        createShape: jest.fn().mockResolvedValue({
          setMetadata: jest.fn(),
          getMetadata: jest.fn(),
          sync: jest.fn(),
          id: 's1',
          type: 'shape',
        }),
        createText: jest.fn().mockResolvedValue({
          setMetadata: jest.fn(),
          getMetadata: jest.fn(),
          sync: jest.fn(),
          id: 't1',
          type: 'text',
        }),
        createFrame: jest.fn().mockResolvedValue({
          add: jest.fn(),
          id: 'f1',
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
    resetBoardCache();
    jest.spyOn(templateModule, 'createFromTemplate').mockResolvedValue({
      type: 'shape',
      setMetadata: jest.fn(),
      getMetadata: jest.fn(),
      getItems: jest.fn(),
      sync: jest.fn(),
      id: 's1',
    } as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    resetBoardCache();
  });

  it('processGraph runs without throwing and syncs items', async () => {
    await processor.processGraph(sample as any);
  });
  it('throws on invalid graph', async () => {
    await expect(processor.processGraph({} as any)).rejects.toThrow(
      'Invalid graph'
    );
  });

  it('positions frame at space center', async () => {
    const simpleGraph = { nodes: [{ id: 'n1', label: 'A', type: 'Role' }], edges: [] };
    // Mock layout with a single node to make dimensions deterministic
    jest.spyOn(require('../src/elk-layout'), 'layoutGraph').mockResolvedValue({
      nodes: { n1: { x: 0, y: 0, width: 10, height: 10 } },
      edges: [],
    });

    await processor.processGraph(simpleGraph as any);

    const createArgs = (global.miro.board.createFrame as jest.Mock).mock.calls[0][0];
    expect(createArgs.width).toBe(210);
    expect(createArgs.height).toBe(210);
    expect(createArgs.x).toBe(0);
    expect(createArgs.y).toBe(0);

    const offset = (processor as any).calculateOffset(
      { x: 0, y: 0 },
      210,
      210,
      { minX: 0, minY: 0 },
      100
    );
    expect(offset.offsetX).toBe(-5);
    expect(offset.offsetY).toBe(-5);

    expect(global.miro.board.viewport.zoomTo).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'f1' })
    );
  });

  it('zooms to shapes when no frame created', async () => {
    const simpleGraph = { nodes: [{ id: 'n1', label: 'A', type: 'Role' }], edges: [] };
    jest.spyOn(require('../src/elk-layout'), 'layoutGraph').mockResolvedValue({
      nodes: { n1: { x: 0, y: 0, width: 10, height: 10 } },
      edges: [],
    });

    await processor.processGraph(simpleGraph as any, { createFrame: false });

    expect(global.miro.board.viewport.zoomTo).toHaveBeenCalledWith([
      expect.objectContaining({ id: 's1' }),
    ]);
  });
});
