import { edgesToHierarchy, hierarchyToEdges } from '../src/core/graph/convert';
import { GraphProcessor } from '../src/core/graph/graph-processor';
import { HierarchyProcessor } from '../src/core/graph/hierarchy-processor';
import { layoutEngine } from '../src/core/layout/elk-layout';
import * as nestedLayout from '../src/core/layout/nested-layout';
import { templateManager } from '../src/board/templates';

interface GlobalWithMiro {
  miro?: { board?: Record<string, unknown> };
}

declare const global: GlobalWithMiro;

describe('graph conversion helpers', () => {
  test('edgesToHierarchy builds nested structure', () => {
    const graph = {
      nodes: [
        { id: 'p', label: 'P', type: 'Role' },
        { id: 'c', label: 'C', type: 'Role' },
      ],
      edges: [{ from: 'p', to: 'c' }],
    };
    const result = edgesToHierarchy(graph);
    expect(result).toEqual([
      {
        id: 'p',
        label: 'P',
        type: 'Role',
        children: [{ id: 'c', label: 'C', type: 'Role' }],
      },
    ]);
  });

  test('hierarchyToEdges flattens hierarchy', () => {
    const roots = [
      {
        id: 'p',
        label: 'P',
        type: 'Role',
        children: [{ id: 'c', label: 'C', type: 'Role' }],
      },
    ];
    const graph = hierarchyToEdges(roots);
    expect(graph.nodes.map((n) => n.id)).toEqual(['p', 'c']);
    expect(graph.edges).toEqual([{ from: 'p', to: 'c' }]);
  });
});

describe('processor conversions', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    delete global.miro;
  });

  test('GraphProcessor converts hierarchy input', async () => {
    global.miro = {
      board: {
        get: jest.fn().mockResolvedValue([]),
        findEmptySpace: jest
          .fn()
          .mockResolvedValue({ x: 0, y: 0, width: 100, height: 100 }),
        viewport: {
          get: jest
            .fn()
            .mockResolvedValue({ x: 0, y: 0, width: 100, height: 100 }),
          zoomTo: jest.fn(),
          set: jest.fn(),
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
    } as unknown as GlobalWithMiro;
    const gp = new GraphProcessor();
    const hierarchy = [
      {
        id: 'p',
        label: 'P',
        type: 'Role',
        children: [{ id: 'c', label: 'C', type: 'Role' }],
      },
    ];
    const spy = jest
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
        get: jest.fn().mockResolvedValue([]),
        findEmptySpace: jest
          .fn()
          .mockResolvedValue({ x: 0, y: 0, width: 100, height: 100 }),
        viewport: {
          get: jest
            .fn()
            .mockResolvedValue({ x: 0, y: 0, width: 100, height: 100 }),
          zoomTo: jest.fn(),
          set: jest.fn(),
        },
        createShape: jest
          .fn()
          .mockResolvedValue({
            id: 's1',
            type: 'shape',
            setMetadata: jest.fn(),
            getMetadata: jest.fn(),
            sync: jest.fn(),
          }),
        createText: jest
          .fn()
          .mockResolvedValue({
            id: 't1',
            type: 'text',
            setMetadata: jest.fn(),
            getMetadata: jest.fn(),
            sync: jest.fn(),
          }),
        group: jest
          .fn()
          .mockResolvedValue({
            id: 'g1',
            type: 'group',
            getItems: jest.fn().mockResolvedValue([]),
            setMetadata: jest.fn(),
            sync: jest.fn(),
          }),
        createFrame: jest.fn().mockResolvedValue({ add: jest.fn(), id: 'f1' }),
      },
    } as unknown as GlobalWithMiro;

    const gp = new GraphProcessor();
    const layoutSpy = jest
      .spyOn(nestedLayout, 'layoutHierarchy')
      .mockResolvedValue({
        nodes: { p: { x: 0, y: 0, width: 10, height: 10 } },
      });
    const hierSpy = jest.spyOn(layoutEngine, 'layoutGraph');
    const graph = { nodes: [{ id: 'p', label: 'P', type: 'Role' }], edges: [] };
    await gp.processGraph(graph as Parameters<typeof gp.processGraph>[0], {
      layout: { algorithm: 'box' },
    });
    expect(layoutSpy).toHaveBeenCalled();
    expect(hierSpy).not.toHaveBeenCalled();
  });

  test('HierarchyProcessor converts graph input', async () => {
    global.miro = {
      board: {
        get: jest.fn().mockResolvedValue([]),
        findEmptySpace: jest
          .fn()
          .mockResolvedValue({ x: 0, y: 0, width: 100, height: 100 }),
        viewport: {
          get: jest
            .fn()
            .mockResolvedValue({ x: 0, y: 0, width: 100, height: 100 }),
          zoomTo: jest.fn(),
        },
        createFrame: jest.fn().mockResolvedValue({ add: jest.fn(), id: 'f1' }),
        group: jest.fn().mockResolvedValue({ id: 'g1', type: 'group' }),
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
      },
    } as unknown as GlobalWithMiro;
    jest
      .spyOn(templateManager, 'createFromTemplate')
      .mockResolvedValue({
        type: 'shape',
        setMetadata: jest.fn(),
        getItems: jest.fn().mockResolvedValue([]),
        sync: jest.fn(),
        id: 's1',
      } as unknown);
    const proc = new HierarchyProcessor();
    const graph = {
      nodes: [
        { id: 'p', label: 'P', type: 'Role' },
        { id: 'c', label: 'C', type: 'Role' },
      ],
      edges: [{ from: 'p', to: 'c' }],
    };
    const spy = jest
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
