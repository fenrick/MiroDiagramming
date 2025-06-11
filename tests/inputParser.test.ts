import { parseGraph } from '../src/logic/inputParser';

describe('parseGraph', () => {
  test('throws for non-object input', () => {
    expect(() => parseGraph(null)).toThrow('Input must be an object');
  });

  test('throws when nodes or edges are missing', () => {
    expect(() => parseGraph({ nodes: [] })).toThrow(
      'Input must contain nodes[] and edges[]'
    );
  });

  test('throws when node id is not string', () => {
    const data = { nodes: [{ id: 1 }], edges: [] };
    expect(() => parseGraph(data)).toThrow('Node id must be a string');
  });

  test('throws when edge is missing endpoints', () => {
    const data = { nodes: [{ id: 'a' }], edges: [{ source: 'a' }] };
    expect(() => parseGraph(data)).toThrow('Edges must have source and target');
  });

  test('returns parsed graph for valid input', () => {
    const json = {
      nodes: [{ id: 'n1' }],
      edges: [{ id: 'e1', source: 'n1', target: 'n1' }],
    };
    const graph = parseGraph(json);
    expect(graph.nodes[0].id).toBe('n1');
    expect(graph.edges[0].source).toBe('n1');
  });
});
