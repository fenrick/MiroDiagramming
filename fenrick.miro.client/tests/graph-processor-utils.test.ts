import { GraphProcessor } from '../src/core/graph/graph-processor';
import type { GraphData } from '../src/core/graph/graph-service';

describe('GraphProcessor private helpers', () => {
  test('buildLayoutInput returns input when mode not layout', () => {
    const gp = new GraphProcessor();
    const data: GraphData = { nodes: [], edges: [] } as GraphData;
    // cast to any to access private method
    const result = (
      gp as unknown as {
        buildLayoutInput: (
          d: GraphData,
          e: Record<string, unknown>,
          m: 'move' | 'layout' | 'ignore',
        ) => GraphData;
      }
    ).buildLayoutInput(data, {}, 'move');
    expect(result).toBe(data);
  });

  test('buildLayoutInput injects coordinates when mode layout', () => {
    const gp = new GraphProcessor();
    const data: GraphData = {
      nodes: [{ id: 'n1', label: 'A', type: 'Motivation' }],
      edges: [],
    } as GraphData;
    const existing = { n1: { x: 10, y: 20 } } as Record<string, unknown>;
    const result = (
      gp as unknown as {
        buildLayoutInput: (
          d: GraphData,
          e: Record<string, unknown>,
          m: 'move' | 'layout' | 'ignore',
        ) => GraphData;
      }
    ).buildLayoutInput(data, existing, 'layout');
    expect(result.nodes[0]).toMatchObject({ metadata: { x: 10, y: 20 } });
  });

  test('validateGraph throws on missing node reference', () => {
    const gp = new GraphProcessor();
    const bad: GraphData = {
      nodes: [{ id: 'n1', label: 'A', type: 'Motivation' }],
      edges: [{ from: 'n1', to: 'n2' }],
    } as GraphData;
    expect(() =>
      (
        gp as unknown as { validateGraph: (g: GraphData) => void }
      ).validateGraph(bad),
    ).toThrow('Edge references missing node: n2');
  });

  test('validateGraph accepts well formed graph', () => {
    const gp = new GraphProcessor();
    const good: GraphData = {
      nodes: [
        { id: 'n1', label: 'A', type: 'Motivation' },
        { id: 'n2', label: 'B', type: 'Application' },
      ],
      edges: [{ from: 'n1', to: 'n2' }],
    } as GraphData;
    expect(() =>
      (
        gp as unknown as { validateGraph: (g: GraphData) => void }
      ).validateGraph(good),
    ).not.toThrow();
  });
});
