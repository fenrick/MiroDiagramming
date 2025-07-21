import { beforeEach, expect, test, vi } from 'vitest';
import { ShapeClient, type ShapeData } from '../src/core/utils/shape-client';

vi.stubGlobal('fetch', vi.fn());

beforeEach(() => {
  (fetch as unknown as vi.Mock).mockReset();
});

test('createShape sends single payload', async () => {
  const api = new ShapeClient('/api');
  const shape: ShapeData = { shape: 'rect', x: 0, y: 0, width: 1, height: 1 };
  await api.createShape(shape);
  expect((fetch as vi.Mock).mock.calls).toHaveLength(1);
  expect(JSON.parse((fetch as vi.Mock).mock.calls[0][1].body)).toHaveLength(1);
});

test('createShapes posts all shapes in one request', async () => {
  const api = new ShapeClient('/api');
  const shapes = Array.from({ length: 25 }, (_, i) => ({
    shape: 'r',
    x: i,
    y: 0,
    width: 1,
    height: 1,
  }));
  await api.createShapes(shapes);
  expect((fetch as vi.Mock).mock.calls).toHaveLength(1);
  expect(JSON.parse((fetch as vi.Mock).mock.calls[0][1].body)).toHaveLength(25);
});
