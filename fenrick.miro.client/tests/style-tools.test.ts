import { boardCache } from '../src/board/board-cache';
import {
  copyFillFromSelection,
  extractFillColor,
  findStyleKey,
  tweakBorderWidth,
  tweakFillColor,
  tweakOpacity,
} from '../src/board/style-tools';

describe('style-tools', () => {
  beforeEach(() => boardCache.reset());
  test('tweakFillColor adjusts fill and font', async () => {
    const item = {
      style: { fillColor: '#808080', color: '#808080' },
      sync: jest.fn(),
    };
    const board = { getSelection: jest.fn().mockResolvedValue([item]) };
    await tweakFillColor(0.5, board);
    expect(item.style.fillColor).toBe('#c0c0c0');
    expect(item.style.color).toMatch(/^#(fff|000|1c1c1e)/i);
    expect(item.sync).toHaveBeenCalled();
  });

  test('tweakFillColor updates frame styles', async () => {
    const item = {
      style: { fillColor: '#333333', color: '#ffffff' },
      sync: jest.fn(),
      type: 'frame',
    };
    const board = { getSelection: jest.fn().mockResolvedValue([item]) };
    await tweakFillColor(0.2, board);
    expect(item.style.fillColor).toMatch(/^#/);
    expect(item.sync).toHaveBeenCalled();
  });

  test('tweakFillColor respects textColor', async () => {
    const item = {
      style: { fillColor: '#555555', textColor: '#000000' },
      sync: jest.fn(),
    };
    const board = { getSelection: jest.fn().mockResolvedValue([item]) };
    await tweakFillColor(-0.2, board);
    expect(item.style.fillColor).toMatch(/^#/);
    expect(item.style.textColor).toMatch(/^#/);
  });

  test('tweakFillColor supports backgroundColor', async () => {
    const item = {
      style: { backgroundColor: '#777777', color: '#ffffff' },
      sync: jest.fn(),
    };
    const board = { getSelection: jest.fn().mockResolvedValue([item]) };
    await tweakFillColor(0.1, board);
    expect(item.style.backgroundColor).toMatch(/^#/);
    expect(item.style.color).toMatch(/^#/);
  });

  test('tweakFillColor skips unsupported items', async () => {
    const items = [
      { style: { fillColor: '#fff' }, sync: jest.fn() },
      { foo: 1 },
    ];
    const board = { getSelection: jest.fn().mockResolvedValue(items) };
    await tweakFillColor(0.1, board);
    expect(items[0].sync).toHaveBeenCalled();
    expect(items[1]).toEqual({ foo: 1 });
  });

  test('tweakFillColor throws without board', async () =>
    await expect(tweakFillColor(0.1)).rejects.toThrow(
      'Miro board not available',
    ));

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

  test('findStyleKey returns first present key', () => {
    const style = { foo: 1, bar: 2 } as Record<string, unknown>;
    expect(findStyleKey(style, ['baz', 'bar', 'foo'])).toBe('bar');
    expect(findStyleKey({}, ['a', 'b'])).toBeNull();
  });

  test('tweakOpacity adjusts fillOpacity', async () => {
    const item = { style: { fillOpacity: 0.4 }, sync: jest.fn() };
    const board = { getSelection: jest.fn().mockResolvedValue([item]) };
    await tweakOpacity(0.3, board);
    expect(item.style.fillOpacity).toBeCloseTo(0.7);
    expect(item.sync).toHaveBeenCalled();
  });

  test('tweakOpacity clamps between 0 and 1', async () => {
    const item = { style: { opacity: 0.9 }, sync: jest.fn() };
    const board = { getSelection: jest.fn().mockResolvedValue([item]) };
    await tweakOpacity(0.3, board);
    expect(item.style.opacity).toBe(1);
  });

  test('tweakOpacity skips unsupported items', async () => {
    const items = [{ style: { opacity: 0.5 }, sync: jest.fn() }, { foo: 1 }];
    const board = { getSelection: jest.fn().mockResolvedValue(items) };
    await tweakOpacity(0.1, board);
    expect(items[0].style.opacity).toBeCloseTo(0.6);
    expect(items[1]).toEqual({ foo: 1 });
  });

  test('tweakBorderWidth updates border style', async () => {
    const item = { style: { borderWidth: 1 }, sync: jest.fn() };
    const board = { getSelection: jest.fn().mockResolvedValue([item]) };
    await tweakBorderWidth(2, board);
    expect(item.style.borderWidth).toBe(3);
    expect(item.sync).toHaveBeenCalled();
  });

  test('tweakBorderWidth handles strokeWidth', async () => {
    const item = { style: { strokeWidth: 2 }, sync: jest.fn() };
    const board = { getSelection: jest.fn().mockResolvedValue([item]) };
    await tweakBorderWidth(-1, board);
    expect(item.style.strokeWidth).toBe(1);
  });

  test('tweakBorderWidth skips unsupported items', async () => {
    const items = [{ style: { lineWidth: 1 }, sync: jest.fn() }, { bar: 2 }];
    const board = { getSelection: jest.fn().mockResolvedValue(items) };
    await tweakBorderWidth(1, board);
    expect(items[0].style.lineWidth).toBe(2);
    expect(items[1]).toEqual({ bar: 2 });
  });
});
