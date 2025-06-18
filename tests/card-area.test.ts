import { prepareArea } from '../src/card-area';

describe('prepareArea', () => {
  test('calculates positions with explicit columns', () => {
    const result = prepareArea(3, { columns: 2 });
    expect(result.width).toBe(700);
    expect(result.height).toBe(500);
    expect(result.positions).toHaveLength(3);
    expect(result.positions[0]).toEqual({ x: -150, y: -100 });
    expect(result.positions[1]).toEqual({ x: 150, y: -100 });
    expect(result.positions[2]).toEqual({ x: -150, y: 100 });
  });

  test('calculates columns from max width', () => {
    const result = prepareArea(4, { maxWidth: 650 });
    // With maxWidth < 650, only one column fits
    expect(result.width).toBe(400);
    expect(result.height).toBe(900);
    expect(result.positions[3].y).toBe(300);
  });
});
