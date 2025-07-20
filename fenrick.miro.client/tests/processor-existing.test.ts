import { BoardBuilder } from '../src/board/board-builder';
import { GraphProcessor } from '../src/core/graph/graph-processor';
import { layoutEngine } from '../src/core/layout/elk-layout';

interface GlobalWithMiro {
  miro?: { board?: Record<string, unknown> };
}

declare const global: GlobalWithMiro;

describe('GraphProcessor with existing nodes', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    delete global.miro;
  });

  test('ignore mode keeps existing position', async () => {
    const processor = new GraphProcessor();
    const shape = {
      id: 's',
      type: 'shape',
      x: 5,
      y: 6,
      sync: jest.fn(),
      setMetadata: jest.fn(),
      getMetadata: jest.fn(),
    } as Record<string, unknown>;
    global.miro = {
      board: {
        getSelection: jest.fn().mockResolvedValue([shape]),
        get: jest.fn().mockResolvedValue([]),
        findEmptySpace: jest
          .fn()
          .mockResolvedValue({ x: 0, y: 0, width: 100, height: 100 }),
        viewport: {
          get: jest
            .fn()
            .mockResolvedValue({ x: 0, y: 0, width: 1000, height: 1000 }),
          zoomTo: jest.fn(),
          set: jest.fn(),
        },
        createConnector: jest
          .fn()
          .mockResolvedValue({
            setMetadata: jest.fn(),
            getMetadata: jest.fn(),
            sync: jest.fn(),
            id: 'c',
          }),
        createShape: jest.fn(),
        createText: jest.fn(),
        createFrame: jest.fn().mockResolvedValue({ id: 'f' }),
        group: jest
          .fn()
          .mockResolvedValue({
            type: 'group',
            getItems: jest.fn().mockResolvedValue([]),
          }),
      },
    };
    jest
      .spyOn(BoardBuilder.prototype, 'findNodeInSelection')
      .mockResolvedValue(shape as unknown);
    jest
      .spyOn(BoardBuilder.prototype, 'createNode')
      .mockResolvedValue(shape as unknown);
    jest
      .spyOn(layoutEngine, 'layoutGraph')
      .mockResolvedValue({
        nodes: { n1: { x: 0, y: 0, width: 10, height: 10 } },
        edges: [],
      });
    const graph = { nodes: [{ id: 'n1', label: 'L', type: 'T' }], edges: [] };
    await processor.processGraph(graph as unknown, {
      existingMode: 'ignore',
      createFrame: false,
    });
    expect((shape as { x: number }).x).toBe(5);
    expect(BoardBuilder.prototype.createNode).not.toHaveBeenCalled();
  });

  test('layout mode forwards coordinates to layout engine', async () => {
    const processor = new GraphProcessor();
    const shape = {
      id: 's',
      type: 'shape',
      x: 10,
      y: 20,
      sync: jest.fn(),
      setMetadata: jest.fn(),
      getMetadata: jest.fn(),
    } as Record<string, unknown>;
    global.miro = {
      board: {
        getSelection: jest.fn().mockResolvedValue([shape]),
        get: jest.fn().mockResolvedValue([]),
        findEmptySpace: jest
          .fn()
          .mockResolvedValue({ x: 0, y: 0, width: 100, height: 100 }),
        viewport: {
          get: jest
            .fn()
            .mockResolvedValue({ x: 0, y: 0, width: 1000, height: 1000 }),
          zoomTo: jest.fn(),
          set: jest.fn(),
        },
        createConnector: jest
          .fn()
          .mockResolvedValue({
            setMetadata: jest.fn(),
            getMetadata: jest.fn(),
            sync: jest.fn(),
            id: 'c',
          }),
        createShape: jest.fn(),
        createText: jest.fn(),
        createFrame: jest.fn().mockResolvedValue({ id: 'f' }),
        group: jest
          .fn()
          .mockResolvedValue({
            type: 'group',
            getItems: jest.fn().mockResolvedValue([]),
          }),
      },
    };
    jest
      .spyOn(BoardBuilder.prototype, 'findNodeInSelection')
      .mockResolvedValue(shape as unknown);
    const spy = jest
      .spyOn(layoutEngine, 'layoutGraph')
      .mockImplementation(async (g) => {
        expect((g as { nodes: unknown[] }).nodes[0]).toHaveProperty('metadata');
        return {
          nodes: { n1: { x: 0, y: 0, width: 10, height: 10 } },
          edges: [],
        };
      });
    const graph = { nodes: [{ id: 'n1', label: 'L', type: 'T' }], edges: [] };
    await processor.processGraph(graph as unknown, {
      existingMode: 'layout',
      createFrame: false,
    });
    expect(spy).toHaveBeenCalled();
  });
});
