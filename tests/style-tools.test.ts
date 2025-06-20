import { applyStyleToSelection } from '../src/style-tools';

describe('style-tools', () => {
  test('applyStyleToSelection merges style', async () => {
    const item = { style: {}, sync: jest.fn() };
    const board = { selection: { get: jest.fn().mockResolvedValue([item]) } };
    await applyStyleToSelection({ fillColor: '#f00', fontSize: 12 }, board);
    expect(item.style.fillColor).toBe('#f00');
    expect(item.style.fontSize).toBe(12);
    expect(item.sync).toHaveBeenCalled();
  });
});
