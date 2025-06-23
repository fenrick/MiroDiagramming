import {
  tweakFillColor,
  copyFillFromSelection,
  extractFillColor,
} from '../src/board/style-tools';

describe('style-tools', () => {
  test('tweakFillColor adjusts fill and font', async () => {
    const item = {
      style: { fillColor: '#808080', color: '#808080' },
      sync: jest.fn(),
    };
    const board = { getSelection: jest.fn().mockResolvedValue([item]) };
    await tweakFillColor(0.5, board);
    expect(item.style.fillColor).toBe('#c0c0c0');
    expect(item.style.color).toMatch(/^#(fff|000)/i);
    expect(item.sync).toHaveBeenCalled();
  });

  test('tweakFillColor throws without board', async () => {
    await expect(tweakFillColor(0.1)).rejects.toThrow(
      'Miro board not available',
    );
  });

  test('copyFillFromSelection returns colour', async () => {
    const board = {
      getSelection: jest
        .fn()
        .mockResolvedValue([{ style: { fillColor: '#abcdef' } }]),
    };
    const colour = await copyFillFromSelection(board);
    expect(colour).toBe('#abcdef');
  });

  test('copyFillFromSelection returns null when missing', async () => {
    const board = { getSelection: jest.fn().mockResolvedValue([{}]) };
    const colour = await copyFillFromSelection(board);
    expect(colour).toBeNull();
  });

  test('extractFillColor resolves colour', () => {
    const item = { style: { fillColor: '#123456' } };
    expect(extractFillColor(item)).toBe('#123456');
    expect(extractFillColor(undefined)).toBeNull();
  });
});
