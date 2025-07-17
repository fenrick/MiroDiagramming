/** @vitest-environment jsdom */
import {
  adjustColor,
  contrastRatio,
  ensureContrast,
  resolveColor,
  hexToRgb,
  rgbToHex,
  mixColors,
} from 'fenrick.miro.ux/core/utils/color-utils';

describe('color-utils', () => {
  test('adjustColor lightens and darkens', () => {
    expect(adjustColor('#808080', 0.5)).toBe('#c0c0c0');
    expect(adjustColor('#808080', -0.5)).toBe('#404040');
  });

  test('contrastRatio matches examples', () => {
    const ratio = contrastRatio('#ffffff', '#000000');
    expect(ratio).toBeCloseTo(21);
  });

  test('ensureContrast picks readable colour', () => {
    const fg = ensureContrast('#0000ff', '#0000ff');
    expect(fg === '#000000' || fg === '#ffffff').toBe(true);
    expect(contrastRatio('#0000ff', fg)).toBeGreaterThanOrEqual(4.5);
  });
});

test('resolveColor reads CSS variable', () => {
  const style = document.documentElement.style;
  style.setProperty('--token', '#123456');
  expect(resolveColor('var(--token)', '#000000')).toBe('#123456');
  style.removeProperty('--token');
});

test('hexToRgb and rgbToHex roundtrip', () => {
  const rgb = hexToRgb('#abcdef');
  expect(rgbToHex(rgb)).toBe('#abcdef');
});

test('mixColors blends values', () => {
  expect(mixColors('#ff0000', '#0000ff', 0.5)).toBe('#800080');
  expect(mixColors('#000000', '#ffffff', 0.25)).toBe('#404040');
});
