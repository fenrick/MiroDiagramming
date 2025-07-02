import {
  layoutHierarchy,
  NestedLayouter,
  nestedLayouter,
} from '../src/core/layout/nested-layout';
import ELK from 'elkjs/lib/elk.bundled.js';
import type { ElkNode } from 'elkjs/lib/elk-api';
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
    const parent = result.nodes.p;
    const childA = result.nodes.a;
    const childB = result.nodes.b;
    expect(childA.y).not.toBe(childB.y);
    expect(parent.width).toBeGreaterThan(childA.width);
    expect(Object.keys(result.nodes)).toContain('spacer_p');
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
    expect(Object.keys(result.nodes)).toHaveLength(105);
    expect(result.nodes['r1c1g1'].width).toBe(120);
    expect(result.nodes['r1c1g1'].height).toBe(30);
  });

  test('computes absolute positions for deep nodes', async () => {
    const data: TestNode[] = [
      {
        id: 'root',
        label: 'Root',
        type: 'Role',
        children: [
          {
            id: 'child',
            label: 'Child',
            type: 'Role',
            children: [
              { id: 'g1', label: 'G1', type: 'Role' },
              { id: 'g2', label: 'G2', type: 'Role' },
            ],
          },
        ],
      },
    ];
    const result = await layoutHierarchy(data);
    const g1 = result.nodes.g1;
    const g2 = result.nodes.g2;
    const child = result.nodes.child;
    expect(g1.x === g2.x && g1.y === g2.y).toBe(false);
    expect(g1.x).toBeGreaterThan(child.x);
    expect(g2.x).toBeGreaterThan(child.x);
  });

  test('computePosition returns null for root node', () => {
    const layouter: NestedLayouter = nestedLayouter;
    const result = layouter.computePosition({ id: 'root' }, 0, 0);
    expect(result).toBeNull();
  });

  test('computePosition returns null when dimensions are missing', () => {
    const layouter: NestedLayouter = nestedLayouter;
    const node = { id: 'x', x: 1, y: 2 };
    const result = layouter.computePosition(node, 0, 0);
    expect(result).toBeNull();
  });

  test('respects padding and top spacing options', async () => {
    const data: TestNode[] = [
      {
        id: 'p',
        label: 'P',
        type: 'Role',
        children: [{ id: 'c', type: 'Role', label: 'C' }],
      },
    ];
    const spy = vi
      .spyOn(ELK.prototype, 'layout')
      .mockResolvedValue({ children: [] } as unknown as ElkNode);
    await layoutHierarchy(data, { padding: 42, topSpacing: 30 });
    const arg = spy.mock.calls[0][0] as ElkNode;
    expect(arg.layoutOptions?.['elk.spacing.nodeNode']).toBe('42');
    const parent = (arg.children as ElkNode[]).find(
      (n) => n.id === 'p',
    ) as ElkNode;
    expect(parent.children?.[0].id).toBe('spacer_p');
    expect(parent.children?.[0].height).toBe(30);
    spy.mockRestore();
  });
});
