import { createEdges } from '../src/graph';

declare const global: any;

global.miro = {
  board: {
    createConnector: jest.fn().mockResolvedValue({ setMetadata: jest.fn(), sync: jest.fn(), id: 'c1' })
  }
};

test('createEdges skips missing nodes', async () => {
  const edges = [{ from: 'n1', to: 'n2' }];
  const nodeMap = { n1: { id: 'a' } } as any;
  const connectors = await createEdges(edges as any, nodeMap);
  expect(connectors).toHaveLength(0);
});

test('createEdges creates connectors', async () => {
  const edges = [{ from: 'n1', to: 'n2', label: 'l' }];
  const nodeMap = { n1: { id: 'a' }, n2: { id: 'b' } } as any;
  const connectors = await createEdges(edges as any, nodeMap);
  expect(connectors).toHaveLength(1);
});
