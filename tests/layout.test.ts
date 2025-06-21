import { layoutEngine } from '../src/core/elk-layout';

const graph = {
  nodes: [
    { id: 'n1', label: 'A', type: 'Role' },
    { id: 'n2', label: 'B', type: 'BusinessService' },
  ],
  edges: [{ from: 'n1', to: 'n2', label: 'uses' }],
};

test('layoutGraph returns positions for all nodes', async () => {
  const result = await layoutEngine.layoutGraph(
    graph as Parameters<typeof layoutEngine.layoutGraph>[0],
  );
  expect(result.nodes.n1).toBeDefined();
  expect(result.nodes.n2).toBeDefined();
  expect(Array.isArray(result.edges)).toBe(true);
});
