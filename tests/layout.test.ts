import { layoutGraph } from '../src/elk-layout';

const graph = {
  nodes: [
    { id: 'n1', label: 'A', type: 'Role' },
    { id: 'n2', label: 'B', type: 'BusinessService' },
  ],
  edges: [{ from: 'n1', to: 'n2', label: 'uses' }],
};

test('layoutGraph returns positions for all nodes', async () => {
  const result = await layoutGraph(graph as any);
  expect(result.nodes.n1).toBeDefined();
  expect(result.nodes.n2).toBeDefined();
  expect(Array.isArray(result.edges)).toBe(true);
});
