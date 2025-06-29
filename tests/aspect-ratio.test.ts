import { aspectRatioValue, ratioHeight } from '../src/core/utils/aspect-ratio';

describe('aspect-ratio utilities', () => {
  test('aspectRatioValue returns numeric ratios', () => {
    expect(aspectRatioValue('16:9')).toBeCloseTo(16 / 9);
    expect(aspectRatioValue('16:10')).toBeCloseTo(16 / 10);
    expect(aspectRatioValue('4:3')).toBeCloseTo(4 / 3);
    expect(aspectRatioValue('golden')).toBeCloseTo((1 + Math.sqrt(5)) / 2);
  });

  test('ratioHeight computes height', () => {
    const height = ratioHeight(160, aspectRatioValue('16:9'));
    expect(height).toBe(90);
  });
});

test('aspectRatioValue throws on unknown preset', () => {
  expect(() => aspectRatioValue('1:1' as never)).toThrow(
    'Unknown aspect ratio',
  );
});
