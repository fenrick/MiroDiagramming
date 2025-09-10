/** @vitest-environment jsdom */
import { boardCache } from '../src/board/board-cache';
import { applyStylePreset, presetStyle } from '../src/board/format-tools';
import type { StylePreset } from '../src/ui/style-presets';

describe('format-tools', () => {
  beforeEach(() => boardCache.reset());
  const preset: StylePreset = {
    label: 'Test',
    fontColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#000000',
    fillColor: '#ff00ff',
  };

  test('applyStylePreset updates style', async () => {
    const item = { style: {}, sync: vi.fn() };
    const board = { getSelection: vi.fn().mockResolvedValue([item]) };
    await applyStylePreset(preset, board);
    expect(item.style).toEqual({
      color: preset.fontColor,
      borderColor: preset.borderColor,
      borderWidth: preset.borderWidth,
      fillColor: preset.fillColor,
    });
    expect(item.sync).toHaveBeenCalled();
  });

  test('applyStylePreset handles items without style', async () => {
    const item = { sync: vi.fn() };
    const board = { getSelection: vi.fn().mockResolvedValue([item]) };
    await applyStylePreset(preset, board);
    expect(item.style).toEqual({
      color: preset.fontColor,
      borderColor: preset.borderColor,
      borderWidth: preset.borderWidth,
      fillColor: preset.fillColor,
    });
  });

  test('applyStylePreset throws without board', async () =>
    await expect(applyStylePreset(preset)).rejects.toThrow(
      'Miro board not available',
    ));

  test('presetStyle resolves colours', () => {
    const style = document.documentElement.style;
    style.setProperty('--test-font', '#111111');
    style.setProperty('--test-border', '#222222');
    style.setProperty('--test-fill', '#333333');
    const presetToken: StylePreset = {
      label: 'Token',
      fontColor: 'var(--test-font)',
      borderWidth: 3,
      borderColor: 'var(--test-border)',
      fillColor: 'var(--test-fill)',
    };
    expect(presetStyle(presetToken)).toEqual({
      color: '#111111',
      borderColor: '#222222',
      borderWidth: 3,
      fillColor: '#333333',
    });
    style.removeProperty('--test-font');
    style.removeProperty('--test-border');
    style.removeProperty('--test-fill');
  });
});
