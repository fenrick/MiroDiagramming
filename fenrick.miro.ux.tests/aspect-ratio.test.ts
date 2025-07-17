import {
  aspectRatioValue,
  ratioHeight,
} from '../fenrick.miro.ux/src/core/utils/aspect-ratio';

describe('aspect-ratio utilities', () => {
  test('aspectRatioValue returns numeric ratios', () => {
    expect(aspectRatioValue('16:9')).toBeCloseTo(16 / 9);
    expect(aspectRatioValue('16:10')).toBeCloseTo(16 / 10);
    expect(aspectRatioValue('4:3')).toBeCloseTo(4 / 3);
    expect(aspectRatioValue('golden')).toBeCloseTo((1 + Math.sqrt(5)) / 2);
    expect(aspectRatioValue('A-landscape')).toBeCloseTo(Math.SQRT2);
    expect(aspectRatioValue('A-portrait')).toBeCloseTo(1 / Math.SQRT2);
  });

  test('ratioHeight computes height', () => {
    const height = ratioHeight(160, aspectRatioValue('A-portrait'));
    expect(height).toBe(Math.round(160 / (1 / Math.SQRT2)));
  });
});

test('aspectRatioValue throws on unknown preset', () => {
  expect(() => aspectRatioValue('1:1' as never)).toThrow(
    'Unknown aspect ratio',
  );
});
