import {
  DEFAULT_LAYOUT_OPTIONS,
  validateLayoutOptions,
} from '../src/elk-options';

describe('validateLayoutOptions', () => {
  test('returns defaults for invalid options', () => {
    const result = validateLayoutOptions({
      algorithm: 'bad' as any,
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
    });
  });
});
