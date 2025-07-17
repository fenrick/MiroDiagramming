import { GraphProcessor } from '../fenrick.miro.ux/src/core/graph/graph-processor';
import { graphService } from '../fenrick.miro.ux/src/core/graph';
import { BoardBuilder } from '../fenrick.miro.ux/src/board/board-builder';
import { templateManager } from '../fenrick.miro.ux/src/board/templates';
import { layoutEngine } from '../fenrick.miro.ux/src/core/layout/elk-layout';
import * as frameUtils from '../fenrick.miro.ux/src/board/frame-utils';
import type { Frame } from '@mirohq/websdk-types';
import sample from './fixtures/sample-graph.json';

interface GlobalWithMiro {
  miro?: { board?: Record<string, unknown> };
}

declare const global: GlobalWithMiro;

describe('GraphProcessor', () => {
  const processor = new GraphProcessor();

  beforeEach(() => {
    global.miro = {
      board: {
        get: jest.fn().mockResolvedValue([]),
        getSelection: jest.fn().mockResolvedValue([]),
        findEmptySpace: jest
          .fn()
          .mockResolvedValue({ x: 0, y: 0, width: 100, height: 100 }),
        viewport: {
          get: jest
            .fn()
            .mockResolvedValue({ x: 0, y: 0, width: 1000, height: 1000 }),
          set: jest.fn().mockResolvedValue({}),
          zoomTo: jest.fn(),
        },
        createConnector: jest
          .fn()
          .mockResolvedValue({
            setMetadata: jest.fn(),
            getMetadata: jest.fn(),
            sync: jest.fn(),
            id: 'c1',
          }),
        createShape: jest
          .fn()
          .mockResolvedValue({
            setMetadata: jest.fn(),
            getMetadata: jest.fn(),
            sync: jest.fn(),
            id: 's1',
            type: 'shape',
          }),
        createText: jest
          .fn()
          .mockResolvedValue({
            setMetadata: jest.fn(),
            getMetadata: jest.fn(),
            sync: jest.fn(),
            id: 't1',
            type: 'text',
          }),
        createFrame: jest.fn().mockResolvedValue({ add: jest.fn(), id: 'f1' }),
        group: jest
          .fn()
          .mockResolvedValue({
            type: 'group',
            getItems: jest.fn().mockResolvedValue([]),
            setMetadata: jest.fn(),
            sync: jest.fn(),
            id: 'g1',
          }),
      },
    };
    graphService.resetBoardCache();
    jest
      .spyOn(templateManager, 'createFromTemplate')
      .mockResolvedValue({
        type: 'shape',
        setMetadata: jest.fn(),
        getMetadata: jest.fn(),
        getItems: jest.fn(),
        sync: jest.fn(),
        id: 's1',
      } as unknown);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    graphService.resetBoardCache();
  });

  it('processGraph runs without throwing and syncs items once after validation', async () => {
    const spy = jest
      .spyOn(BoardBuilder.prototype, 'syncAll')
      .mockResolvedValue();
    await processor.processGraph(sample as unknown);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('delegates work to helper methods', async () => {
    const gp = new GraphProcessor();
    const frameSpy = jest
      .spyOn(frameUtils, 'registerFrame')
      .mockResolvedValue(undefined as unknown as Frame);
    jest.spyOn(frameUtils, 'clearActiveFrame').mockImplementation(() => {});
    const nodeSpy = jest.spyOn(gp as unknown, 'createNodes');
    const connectorSpy = jest.spyOn(gp as unknown, 'createConnectorsAndZoom');

    jest
      .spyOn(layoutEngine, 'layoutGraph')
      .mockResolvedValue({
        nodes: { n1: { x: 0, y: 0, width: 10, height: 10 } },
        edges: [],
      });

    const simpleGraph = {
      nodes: [{ id: 'n1', label: 'A', type: 'Motivation' }],
      edges: [],
    };
    await gp.processGraph(simpleGraph as unknown);

    expect(frameSpy).toHaveBeenCalled();
    expect(nodeSpy).toHaveBeenCalled();
    expect(connectorSpy).toHaveBeenCalled();
  });

  it('forwards layout options', async () => {
    const spy = jest
      .spyOn(layoutEngine, 'layoutGraph')
      .mockResolvedValue({ nodes: {}, edges: [] } as unknown);
    const simpleGraph = { nodes: [], edges: [] };
    await processor.processGraph(simpleGraph as unknown, {
      layout: { algorithm: 'force' },
    });
    expect(spy).toHaveBeenCalledWith(simpleGraph as unknown, {
      algorithm: 'force',
    });
  });

  it('throws on invalid graph', async () => {
    await expect(processor.processGraph({} as unknown)).rejects.toThrow(
      'Invalid graph format',
    );
  });

  it('positions frame at space center', async () => {
    const simpleGraph = {
      nodes: [{ id: 'n1', label: 'A', type: 'Motivation' }],
      edges: [],
    };
    // Mock layout with a single node to make dimensions deterministic
    jest
      .spyOn(layoutEngine, 'layoutGraph')
      .mockResolvedValue({
        nodes: { n1: { x: 0, y: 0, width: 10, height: 10 } },
        edges: [],
      });

    await processor.processGraph(simpleGraph as unknown);

    const createArgs = (global.miro.board.createFrame as jest.Mock).mock
      .calls[0][0];
    expect(createArgs.width).toBe(210);
    expect(createArgs.height).toBe(210);
    expect(createArgs.x).toBe(0);
    expect(createArgs.y).toBe(0);

    const offset = (processor as unknown).calculateOffset(
      { x: 0, y: 0 },
      210,
      210,
      { minX: 0, minY: 0 },
      100,
    );
    expect(offset.offsetX).toBe(-5);
    expect(offset.offsetY).toBe(-5);

    expect(global.miro.board.viewport.zoomTo).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'f1' }),
    );
  });

  it('zooms to shapes when no frame created', async () => {
    const simpleGraph = {
      nodes: [{ id: 'n1', label: 'A', type: 'Motivation' }],
      edges: [],
    };
    jest
      .spyOn(layoutEngine, 'layoutGraph')
      .mockResolvedValue({
        nodes: { n1: { x: 0, y: 0, width: 10, height: 10 } },
        edges: [],
      });

    await processor.processGraph(simpleGraph as unknown, {
      createFrame: false,
    });

    expect(global.miro.board.viewport.zoomTo).toHaveBeenCalledWith([
      expect.objectContaining({ id: 's1' }),
    ]);
  });

  it('records widget ids for rows', async () => {
    const simpleGraph = {
      nodes: [
        { id: 'n1', label: 'A', type: 'Motivation', metadata: { rowId: 'r1' } },
      ],
      edges: [],
    };
    jest
      .spyOn(layoutEngine, 'layoutGraph')
      .mockResolvedValue({
        nodes: { n1: { x: 0, y: 0, width: 10, height: 10 } },
        edges: [],
      });

    await processor.processGraph(simpleGraph as unknown);

    expect(processor.getNodeIdMap()).toEqual({ n1: 's1' });
  });

  it('throws when edge source is missing', async () => {
    const graph = {
      nodes: [{ id: 'n1', label: 'A', type: 'Motivation' }],
      edges: [{ from: 'n2', to: 'n1' }],
    };
    await expect(processor.processGraph(graph as unknown)).rejects.toThrow(
      'Edge references missing node: n2',
    );
  });

  it('throws when edge target is missing', async () => {
    const graph = {
      nodes: [{ id: 'n1', label: 'A', type: 'Motivation' }],
      edges: [{ from: 'n1', to: 'n2' }],
    };
    await expect(processor.processGraph(graph as unknown)).rejects.toThrow(
      'Edge references missing node: n2',
    );
  });
});
