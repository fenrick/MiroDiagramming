import { templateManager } from '../src/board/templates';
import { edgesToHierarchy, hierarchyToEdges } from '../src/core/graph/convert';
import { GraphProcessor } from '../src/core/graph/graph-processor';
import { HierarchyProcessor } from '../src/core/graph/hierarchy-processor';
import { layoutEngine } from '../src/core/layout/elk-layout';
import * as nestedLayout from '../src/core/layout/nested-layout';

interface GlobalWithMiro {
  miro?: { board?: Record<string, unknown> };
}

declare const global: GlobalWithMiro;

describe('graph conversion helpers', () => {
  test('edgesToHierarchy builds nested structure', () => {
    const graph = {
      nodes: [
        { id: 'p', label: 'P', type: 'Motivation' },
        { id: 'c', label: 'C', type: 'Motivation' },
      ],
      edges: [{ from: 'p', to: 'c' }],
    };
    const result = edgesToHierarchy(graph);
    expect(result).toEqual([
      {
        id: 'p',
        label: 'P',
        type: 'Motivation',
        children: [{ id: 'c', label: 'C', type: 'Motivation' }],
      },
    ]);
  });

  test('hierarchyToEdges flattens hierarchy', () => {
    const roots = [
      {
        id: 'p',
        label: 'P',
        type: 'Motivation',
        children: [{ id: 'c', label: 'C', type: 'Motivation' }],
      },
    ];
    const graph = hierarchyToEdges(roots);
    expect(graph.nodes.map(n => n.id)).toEqual(['p', 'c']);
    expect(graph.edges).toEqual([{ from: 'p', to: 'c' }]);
  });
});

describe('processor conversions', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete global.miro;
  });

  test('GraphProcessor converts hierarchy input', async () => {
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
            .mockResolvedValue({ x: 0, y: 0, width: 100, height: 100 }),
          zoomTo: vi.fn(),
          set: vi.fn(),
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
    } as unknown as GlobalWithMiro;
    const gp = new GraphProcessor();
    const hierarchy = [
      {
        id: 'p',
        label: 'P',
        type: 'Motivation',
        children: [{ id: 'c', label: 'C', type: 'Motivation' }],
      },
    ];
    const spy = vi
      .spyOn(layoutEngine, 'layoutGraph')
      .mockResolvedValue({
        nodes: {
          p: { x: 0, y: 0, width: 10, height: 10 },
          c: { x: 10, y: 0, width: 10, height: 10 },
        },
        edges: [],
      } as unknown);
    await gp.processGraph(
      hierarchy as unknown as Parameters<typeof gp.processGraph>[0],
    );
    expect(spy).toHaveBeenCalled();
    const arg = (spy.mock.calls[0] as unknown[])[0] as {
      nodes: unknown[];
      edges: unknown[];
    };
    expect(arg.nodes).toHaveLength(2);
    expect(arg.edges).toEqual([{ from: 'p', to: 'c' }]);
  });

  test('GraphProcessor uses nested layout for box algorithm', async () => {
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
            .mockResolvedValue({ x: 0, y: 0, width: 100, height: 100 }),
          zoomTo: vi.fn(),
          set: vi.fn(),
        },
        createShape: vi
          .fn()
          .mockResolvedValue({
            id: 's1',
            type: 'shape',
            setMetadata: vi.fn(),
            getMetadata: vi.fn(),
            sync: vi.fn(),
          }),
        createText: vi
          .fn()
          .mockResolvedValue({
            id: 't1',
            type: 'text',
            setMetadata: vi.fn(),
            getMetadata: vi.fn(),
            sync: vi.fn(),
          }),
        group: vi
          .fn()
          .mockResolvedValue({
            id: 'g1',
            type: 'group',
            getItems: vi.fn().mockResolvedValue([]),
            setMetadata: vi.fn(),
            sync: vi.fn(),
          }),
        createFrame: vi.fn().mockResolvedValue({ add: vi.fn(), id: 'f1' }),
      },
    } as unknown as GlobalWithMiro;

    const gp = new GraphProcessor();
    const layoutSpy = vi
      .spyOn(nestedLayout, 'layoutHierarchy')
      .mockResolvedValue({
        nodes: { p: { x: 0, y: 0, width: 10, height: 10 } },
      });
    const hierSpy = vi.spyOn(layoutEngine, 'layoutGraph');
    const graph = {
      nodes: [{ id: 'p', label: 'P', type: 'Motivation' }],
      edges: [],
    };
    await gp.processGraph(graph as Parameters<typeof gp.processGraph>[0], {
      layout: { algorithm: 'box' },
    });
    expect(layoutSpy).toHaveBeenCalled();
    expect(hierSpy).not.toHaveBeenCalled();
  });

  test('HierarchyProcessor converts graph input', async () => {
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
            .mockResolvedValue({ x: 0, y: 0, width: 100, height: 100 }),
          zoomTo: vi.fn(),
        },
        createFrame: vi.fn().mockResolvedValue({ add: vi.fn(), id: 'f1' }),
        group: vi.fn().mockResolvedValue({ id: 'g1', type: 'group' }),
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
      },
    } as unknown as GlobalWithMiro;
    vi.spyOn(templateManager, 'createFromTemplate').mockResolvedValue({
      type: 'shape',
      setMetadata: vi.fn(),
      getItems: vi.fn().mockResolvedValue([]),
      sync: vi.fn(),
      id: 's1',
    } as unknown);
    const proc = new HierarchyProcessor();
    const graph = {
      nodes: [
        { id: 'p', label: 'P', type: 'Motivation' },
        { id: 'c', label: 'C', type: 'Motivation' },
      ],
      edges: [{ from: 'p', to: 'c' }],
    };
    const spy = vi
      .spyOn(nestedLayout, 'layoutHierarchy')
      .mockResolvedValue({
        nodes: {
          p: { x: 0, y: 0, width: 10, height: 10 },
          c: { x: 10, y: 0, width: 10, height: 10 },
        },
      } as ReturnType<typeof nestedLayout.layoutHierarchy>);
    await proc.processHierarchy(
      graph as unknown as Parameters<typeof proc.processHierarchy>[0],
    );
    expect(spy).toHaveBeenCalled();
  });
});
