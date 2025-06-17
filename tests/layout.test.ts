import { layoutGraph } from '../src/elk-layout';

const graph = {
  nodes: [
    { id: 'n1', label: 'A', type: 'Role' },
    { id: 'n2', label: 'B', type: 'BusinessService' },
  ],
  edges: [{ from: 'n1', to: 'n2', label: 'uses' }],
};

test('layoutGraph returns positions for all nodes', async () => {
  const res = await layoutGraph(graph as any);
  expect(res.nodes.n1).toBeDefined();
  expect(res.nodes.n2).toBeDefined();
  expect(Array.isArray(res.edges)).toBe(true);
});
