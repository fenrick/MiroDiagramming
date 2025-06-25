import { layoutHierarchy } from '../src/core/layout/nested-layout';
import sampleHier from './fixtures/sample-hier.json';

interface TestNode {
  id: string;
  label: string;
  type: string;
  children?: TestNode[];
  metadata?: Record<string, unknown>;
}

describe('layoutHierarchy', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('creates positions for nested nodes', async () => {
    const data: TestNode[] = [
      {
        id: 'p',
        label: 'Parent',
        type: 'Role',
        children: [
          { id: 'a', label: 'A', type: 'Role' },
          { id: 'b', label: 'B', type: 'Role' },
        ],
      },
    ];
    const result = await layoutHierarchy(data);
    expect(Object.keys(result.nodes)).toHaveLength(3);
    const parent = result.nodes.p;
    const childA = result.nodes.a;
    const childB = result.nodes.b;
    expect(childA.y).not.toBe(childB.y);
    expect(parent.width).toBeGreaterThan(childA.width);
  });

  test('sorts children by custom key', async () => {
    const data: TestNode[] = [
      {
        id: 'p',
        label: 'Parent',
        type: 'Role',
        children: [
          { id: 'a', label: 'B', type: 'Role', metadata: { id: 2 } },
          { id: 'b', label: 'A', type: 'Role', metadata: { id: 1 } },
        ],
      },
    ];
    const result = await layoutHierarchy(data, { sortKey: 'id' });
    const first = result.nodes.a.x < result.nodes.b.x ? 'a' : 'b';
    expect(first).toBe('b');
  });

  test('assigns fixed leaf size', async () => {
    const data: TestNode[] = [{ id: 'n', label: 'N', type: 'Role' }];
    const result = await layoutHierarchy(data);
    expect(result.nodes.n.width).toBe(120);
    expect(result.nodes.n.height).toBe(30);
  });

  test('positions example dataset', async () => {
    const result = await layoutHierarchy(sampleHier as TestNode[]);
    expect(Object.keys(result.nodes)).toHaveLength(84);
    expect(result.nodes['r1c1g1'].width).toBe(120);
    expect(result.nodes['r1c1g1'].height).toBe(30);
  });
});
