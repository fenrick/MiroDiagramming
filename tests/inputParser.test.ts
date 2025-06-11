import {
  parseGraph,
  validateNodes,
  validateEdges,
} from '../src/logic/inputParser';

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

  test('throws when edge references unknown nodes', () => {
    const data = {
      nodes: [{ id: 'a' }],
      edges: [{ id: 'e1', source: 'a', target: 'b' }],
    };
    expect(() => parseGraph(data)).toThrow(
      'Edges must reference existing node ids'
    );
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

describe('validateNodes', () => {
  test('throws when node id is not string', () => {
    expect(() => validateNodes([{ id: 1 } as any])).toThrow(
      'Node id must be a string'
    );
  });

  test('throws when node type is invalid', () => {
    expect(() => validateNodes([{ id: 'a', type: 5 } as any])).toThrow(
      'Node type must be a string if provided'
    );
  });

  test('returns nodes array for valid input', () => {
    const nodes = [{ id: 'n1' }];
    expect(validateNodes(nodes)).toBe(nodes as any);
  });
});

describe('validateEdges', () => {
  test('throws when edge is missing endpoints', () => {
    expect(() => validateEdges([{ id: 'e1', source: 'a' } as any])).toThrow(
      'Edges must have source and target'
    );
  });

  test('returns edges array for valid input', () => {
    const edges = [{ id: 'e1', source: 'a', target: 'b' }];
    expect(validateEdges(edges)).toBe(edges as any);
  });
});
