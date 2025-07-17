import {
  DEFAULT_LAYOUT_OPTIONS,
  validateLayoutOptions,
} from '../fenrick.miro.ux/src/core/layout/elk-options';

describe('validateLayoutOptions', () => {
  test('returns defaults for invalid options', () => {
    const result = validateLayoutOptions({
      algorithm: 'bad' as unknown as never,
      spacing: -1,
    });
    expect(result).toEqual(DEFAULT_LAYOUT_OPTIONS);
  });

  test('accepts valid options', () => {
    const result = validateLayoutOptions({
      algorithm: 'force',
      direction: 'LEFT',
      spacing: 50,
    });
    expect(result).toEqual({
      algorithm: 'force',
      direction: 'LEFT',
      spacing: 50,
      aspectRatio: '16:10',
      edgeRouting: undefined,
      edgeRoutingMode: undefined,
      optimizationGoal: undefined,
    });
  });

  for (const alg of ['rectpacking', 'box', 'radial'] as const) {
    test(`supports ${alg} algorithm`, () => {
      const result = validateLayoutOptions({ algorithm: alg });
      expect(result.algorithm).toBe(alg);
    });
  }
});
