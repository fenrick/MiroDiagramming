import { applyStylePreset } from '../src/board/format-tools';
import type { StylePreset } from '../src/ui/style-presets';

describe('format-tools', () => {
  const preset: StylePreset = {
    id: 't',
    label: 'Test',
    fontColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#000000',
    fillColor: '#ff00ff',
  };

  test('applyStylePreset updates style', async () => {
    const item = { style: {}, sync: jest.fn() };
    const board = { getSelection: jest.fn().mockResolvedValue([item]) };
    await applyStylePreset(preset, board);
    expect(item.style).toEqual({
      color: preset.fontColor,
      borderColor: preset.borderColor,
      borderWidth: preset.borderWidth,
      fillColor: preset.fillColor,
    });
    expect(item.sync).toHaveBeenCalled();
  });

  test('applyStylePreset throws without board', async () => {
    await expect(applyStylePreset(preset)).rejects.toThrow(
      'Miro board not available',
    );
  });
});
