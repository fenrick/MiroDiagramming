import {
  computeEdgeHints,
  relativePosition,
  boundingBox,
  frameOffset,
} from '../src/core/layout/layout-utils';

describe('layout-utils', () => {
  test('relativePosition computes fractions', () => {
    const pos = relativePosition(
      { x: 50, y: 50, width: 100, height: 200 },
      { x: 75, y: 100 },
    );
    expect(pos).toEqual({ x: 0.25, y: 0.25 });
  });

  test('computeEdgeHints maps edge points', () => {
    const graph = { edges: [{ from: 'a', to: 'b' }] };
    const layout = {
      nodes: {
        a: { x: 0, y: 0, width: 100, height: 100 },
        b: { x: 100, y: 100, width: 100, height: 100 },
      },
      edges: [{ startPoint: { x: 10, y: 20 }, endPoint: { x: 150, y: 180 } }],
    };
    const hints = computeEdgeHints(graph, layout);
    expect(hints[0]).toEqual({
      startPosition: { x: 0.1, y: 0.2 },
      endPosition: { x: 0.5, y: 0.8 },
    });
  });

  test('boundingBox handles center coordinates', () => {
    const box = boundingBox(
      {
        a: { x: 5, y: 5, width: 10, height: 10 },
        b: { x: 15, y: 15, width: 10, height: 10 },
      },
      true,
    );
    expect(box).toEqual({ minX: 0, minY: 0, maxX: 20, maxY: 20 });
  });

  test('frameOffset computes relative translation', () => {
    const off = frameOffset(
      { x: 50, y: 50 },
      20,
      20,
      { minX: 10, minY: 10 },
      5,
    );
    expect(off).toEqual({ offsetX: 35, offsetY: 35 });
  });
});
