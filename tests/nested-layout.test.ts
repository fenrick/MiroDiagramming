import { layoutHierarchy } from '../src/core/layout/nested-layout';
import { templateManager } from '../src/board/templates';

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

  test('creates positions for nested nodes', () => {
    vi.spyOn(templateManager, 'getTemplate').mockReturnValue({
      elements: [{ width: 100, height: 60 }],
    });
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
    const result = layoutHierarchy(data);
    expect(Object.keys(result.nodes)).toHaveLength(3);
    const parent = result.nodes.p;
    const childA = result.nodes.a;
    const childB = result.nodes.b;
    expect(childA.x).toBeLessThan(childB.x);
    expect(parent.width).toBe(100);
  });

  test('sorts children by custom key', () => {
    vi.spyOn(templateManager, 'getTemplate').mockReturnValue({
      elements: [{ width: 100, height: 60 }],
    });
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
    const result = layoutHierarchy(data, { sortKey: 'id' });
    const first = result.nodes.a.x < result.nodes.b.x ? 'a' : 'b';
    expect(first).toBe('b');
  });

  test('falls back to golden ratio height', () => {
    vi.spyOn(templateManager, 'getTemplate').mockReturnValue(
      undefined as never,
    );
    const data: TestNode[] = [{ id: 'n', label: 'N', type: 'Role' }];
    const result = layoutHierarchy(data);
    expect(result.nodes.n.height).toBeCloseTo(160 / 1.618, 5);
  });
});
