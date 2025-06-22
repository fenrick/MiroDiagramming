import { layoutEngine } from '../src/core/layout/elk-layout';
import ELK from 'elkjs/lib/elk.bundled.js';

/**
 * Coverage tests for layoutGraph focusing on branch conditions
 * around metadata and edge sections.
 */

test('layoutGraph handles metadata and missing sections', async () => {
  const layoutSpy = jest
    .spyOn(ELK.prototype, 'layout')
    .mockImplementation(async (g: unknown) => {
      // Validate that metadata dimensions are passed through
      expect(g.children[0].width).toBe(99);
      expect(g.children[0].height).toBe(88);
      // Return layout with one edge lacking sections and one with sections
      return {
        children: [{ id: 'n1', x: 1, y: 2, width: 50, height: 60 }],
        edges: [
          { id: 'e0', sections: [] },
          {
            id: 'e1',
            sections: [
              {
                startPoint: { x: 0, y: 0 },
                endPoint: { x: 10, y: 10 },
                bendPoints: [{ x: 5, y: 5 }],
              },
            ],
          },
        ],
      } as unknown;
    });
  const graph = {
    nodes: [
      {
        id: 'n1',
        label: 'A',
        type: 'Role',
        metadata: { width: 99, height: 88 },
      },
    ],
    edges: [
      { from: 'n1', to: 'n1' },
      { from: 'n1', to: 'n1' },
    ],
  };
  const result = await layoutEngine.layoutGraph(
    graph as unknown as Parameters<typeof layoutEngine.layoutGraph>[0],
  );
  // Only the edge with sections should be included
  expect(result.nodes.n1.width).toBe(50);
  expect(result.edges).toHaveLength(1);
  layoutSpy.mockRestore();
});

test('layoutGraph uses defaults when layout values missing', async () => {
  const layoutSpy = jest.spyOn(ELK.prototype, 'layout').mockResolvedValue({
    children: [{ id: 'n2' }],
    edges: [],
  } as unknown);
  const graph = { nodes: [{ id: 'n2', label: 'B', type: 'Role' }], edges: [] };
  const result = await layoutEngine.layoutGraph(
    graph as unknown as Parameters<typeof layoutEngine.layoutGraph>[0],
  );
  // Defaults populate width and position
  expect(result.nodes.n2.width).toBeGreaterThan(0);
  expect(result.nodes.n2.x).toBe(0);
  layoutSpy.mockRestore();
});

test('layoutGraph uses template dimensions when metadata absent', async () => {
  const spy = jest
    .spyOn(ELK.prototype, 'layout')
    .mockImplementation(async (g: unknown) => {
      expect(g.children[0].width).toBe(160);
      expect(g.children[0].height).toBe(60);
      return { children: [{ id: 'n3', x: 0, y: 0 }], edges: [] } as unknown;
    });
  const graph = { nodes: [{ id: 'n3', label: 'C', type: 'Role' }], edges: [] };
  await layoutEngine.layoutGraph(
    graph as unknown as Parameters<typeof layoutEngine.layoutGraph>[0],
  );
  spy.mockRestore();
});

test('layoutGraph handles missing edge sections array', async () => {
  jest
    .spyOn(ELK.prototype, 'layout')
    .mockResolvedValue({ children: [], edges: undefined } as unknown);
  const result = await layoutEngine.layoutGraph({
    nodes: [],
    edges: [],
  } as Parameters<typeof layoutEngine.layoutGraph>[0]);
  expect(result.edges).toEqual([]);
});
