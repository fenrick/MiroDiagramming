import {
  applyStyleToSelection,
  getFillColorFromSelection,
  tweakFillColor,
} from '../src/board/style-tools';

describe('style-tools', () => {
  test('applyStyleToSelection merges style', async () => {
    const item = { style: {}, sync: jest.fn() };
    const board = { getSelection: jest.fn().mockResolvedValue([item]) };
    await applyStyleToSelection({ fillColor: '#f00', fontSize: 12 }, board);
    expect(item.style.fillColor).toBe('#f00');
    expect(item.style.fontSize).toBe(12);
    expect(item.sync).toHaveBeenCalled();
  });

  test('getFillColorFromSelection returns colour', async () => {
    const board = {
      getSelection: jest
        .fn()
        .mockResolvedValue([{ style: { fillColor: '#abc' } }]),
    };
    const color = await getFillColorFromSelection(board);
    expect(color).toBe('#abc');
  });

  test('tweakFillColor adjusts fill and font', async () => {
    const item = {
      style: { fillColor: '#808080', fontColor: '#808080' },
      sync: jest.fn(),
    };
    const board = { getSelection: jest.fn().mockResolvedValue([item]) };
    await tweakFillColor(0.5, board);
    expect(item.style.fillColor).toBe('#c0c0c0');
    expect(item.style.fontColor).toMatch(/^#(fff|000)/i);
    expect(item.sync).toHaveBeenCalled();
  });

  test('getFillColorFromSelection throws without board', async () => {
    await expect(getFillColorFromSelection()).rejects.toThrow(
      'Miro board not available',
    );
  });

  test('applyStyleToSelection throws without board', async () => {
    await expect(applyStyleToSelection({ fillColor: '#fff' })).rejects.toThrow(
      'Miro board not available',
    );
  });

  test('tweakFillColor throws without board', async () => {
    await expect(tweakFillColor(0.1)).rejects.toThrow(
      'Miro board not available',
    );
  });
});
