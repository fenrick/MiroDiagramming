import { HierarchyProcessor } from '../src/core/graph/hierarchy-processor';
import { layoutHierarchy } from '../src/core/layout/nested-layout';

interface Node {
  id: string;
  label: string;
  type: string;
  children?: Node[];
}

describe('HierarchyProcessor computeBounds', () =>
  test('uses center coordinates when calculating bounds', async () => {
    const roots: Node[] = [
      { id: 'r', label: 'Root', type: 'Motivation' },
      { id: 's', label: 'Second', type: 'Motivation' },
    ];
    const layout = await layoutHierarchy(roots);
    const proc = new HierarchyProcessor();
    const bounds = (
      proc as unknown as {
        computeBounds: (r: unknown) => {
          minX: number;
          minY: number;
          maxX: number;
          maxY: number;
        };
      }
    ).computeBounds(layout);
    const r = layout.nodes.r;
    expect(bounds.minX).toBeCloseTo(r.x - r.width / 2);
    expect(bounds.maxX).toBeCloseTo(r.x + r.width / 2);
  }));
