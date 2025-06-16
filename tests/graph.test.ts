import { describe, it, expect } from 'vitest';
import { layoutGraph } from '../src/elk-layout';

const graph = {
  nodes: [
    { id: 'n1', label: 'A', type: 'Role' },
    { id: 'n2', label: 'B', type: 'BusinessService' },
  ],
  edges: [{ from: 'n1', to: 'n2', label: 'uses' }],
};

describe('layoutGraph', () => {
  it('returns positions for all nodes', async () => {
    const pos = await layoutGraph(graph as any);
    expect(pos.n1).toBeDefined();
    expect(pos.n2).toBeDefined();
  });
});
