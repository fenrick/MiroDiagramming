import type { Frame } from '@mirohq/websdk-types';
import { BoardBuilder } from '../src/board/board-builder';
import * as frameUtils from '../src/board/frame-utils';
import { templateManager } from '../src/board/templates';
import { graphService } from '../src/core/graph';
import { GraphProcessor } from '../src/core/graph/graph-processor';
import { layoutEngine } from '../src/core/layout/elk-layout';
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
        get: vi.fn().mockResolvedValue([]),
        getSelection: vi.fn().mockResolvedValue([]),
        findEmptySpace: vi
          .fn()
          .mockResolvedValue({ x: 0, y: 0, width: 100, height: 100 }),
        viewport: {
          get: vi
            .fn()
            .mockResolvedValue({ x: 0, y: 0, width: 1000, height: 1000 }),
          set: vi.fn().mockResolvedValue({}),
          zoomTo: vi.fn(),
        },
        createConnector: vi
          .fn()
          .mockResolvedValue({
            setMetadata: vi.fn(),
            getMetadata: vi.fn(),
            sync: vi.fn(),
            id: 'c1',
          }),
        createShape: vi
          .fn()
          .mockResolvedValue({
            setMetadata: vi.fn(),
            getMetadata: vi.fn(),
            sync: vi.fn(),
            id: 's1',
            type: 'shape',
          }),
        createText: vi
          .fn()
          .mockResolvedValue({
            setMetadata: vi.fn(),
            getMetadata: vi.fn(),
            sync: vi.fn(),
            id: 't1',
            type: 'text',
          }),
        createFrame: vi.fn().mockResolvedValue({ add: vi.fn(), id: 'f1' }),
        group: vi
          .fn()
          .mockResolvedValue({
            type: 'group',
            getItems: vi.fn().mockResolvedValue([]),
            setMetadata: vi.fn(),
            sync: vi.fn(),
            id: 'g1',
          }),
      },
    };
    graphService.resetBoardCache();
    vi.spyOn(templateManager, 'createFromTemplate').mockResolvedValue({
      type: 'shape',
      setMetadata: vi.fn(),
      getMetadata: vi.fn(),
      getItems: vi.fn(),
      sync: vi.fn(),
      id: 's1',
    } as unknown);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    graphService.resetBoardCache();
  });

  it('processGraph runs without throwing and syncs items once after validation', async () => {
    const spy = vi.spyOn(BoardBuilder.prototype, 'syncAll').mockResolvedValue();
    await processor.processGraph(sample as unknown);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('delegates work to helper methods', async () => {
    const gp = new GraphProcessor();
    const frameSpy = vi
      .spyOn(frameUtils, 'registerFrame')
      .mockResolvedValue(undefined as unknown as Frame);
    vi.spyOn(frameUtils, 'clearActiveFrame').mockImplementation(() => {});
    const nodeSpy = vi.spyOn(gp as unknown, 'createNodes');
    const connectorSpy = vi.spyOn(gp as unknown, 'createConnectorsAndZoom');

    vi.spyOn(layoutEngine, 'layoutGraph').mockResolvedValue({
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
    const spy = vi
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

  it('throws on invalid graph', async () =>
    await expect(processor.processGraph({} as unknown)).rejects.toThrow(
      'Invalid graph format',
    ));

  it('positions frame at space center', async () => {
    const simpleGraph = {
      nodes: [{ id: 'n1', label: 'A', type: 'Motivation' }],
      edges: [],
    };
    // Mock layout with a single node to make dimensions deterministic
    vi.spyOn(layoutEngine, 'layoutGraph').mockResolvedValue({
      nodes: { n1: { x: 0, y: 0, width: 10, height: 10 } },
      edges: [],
    });

    await processor.processGraph(simpleGraph as unknown);

    const createArgs = (global.miro.board.createFrame as vi.Mock).mock
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
    vi.spyOn(layoutEngine, 'layoutGraph').mockResolvedValue({
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
    vi.spyOn(layoutEngine, 'layoutGraph').mockResolvedValue({
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
