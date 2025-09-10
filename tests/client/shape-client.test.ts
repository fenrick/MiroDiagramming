import { beforeEach, expect, test, vi } from 'vitest';
import { ShapeClient, type ShapeData } from '../src/core/utils/shape-client';
vi.mock('logfire', () => ({
  span: (_: string, fn: () => unknown) => fn(),
  warning: vi.fn(),
  error: vi.fn(),
}));

vi.stubGlobal('fetch', vi.fn());
vi.stubGlobal('miro', {
  board: { getUserInfo: vi.fn().mockResolvedValue({ id: 'u1' }) },
});

beforeEach(() => {
  (fetch as unknown as vi.Mock).mockReset();
  (fetch as unknown as vi.Mock).mockResolvedValue({
    json: vi.fn().mockResolvedValue([]),
  });
});

test('createShape sends single payload', async () => {
  const api = new ShapeClient('b1', '/api');
  const shape: ShapeData = { shape: 'rect', x: 0, y: 0, width: 1, height: 1 };
  (fetch as vi.Mock).mockResolvedValueOnce({
    json: vi.fn().mockResolvedValue([{ body: '{}' }]),
  });
  const result = await api.createShape(shape);
  const call = (fetch as vi.Mock).mock.calls[0];
  expect((fetch as vi.Mock).mock.calls).toHaveLength(1);
  expect(JSON.parse(call[1].body)).toHaveLength(1);
  expect(call[1].headers.get('Idempotency-Key')).toBeDefined();
  expect(result).toBeDefined();
});

test('createShapes posts all shapes in one request', async () => {
  const api = new ShapeClient('b1', '/api');
  const shapes = Array.from({ length: 25 }, (_, i) => ({
    shape: 'r',
    x: i,
    y: 0,
    width: 1,
    height: 1,
  }));
  (fetch as vi.Mock).mockResolvedValueOnce({
    json: vi.fn().mockResolvedValue(shapes.map(() => ({ body: '{}' }))),
  });
  const res = await api.createShapes(shapes);
  const call = (fetch as vi.Mock).mock.calls[0];
  expect((fetch as vi.Mock).mock.calls).toHaveLength(1);
  expect(JSON.parse(call[1].body)).toHaveLength(25);
  expect(call[1].headers.get('Idempotency-Key')).toBeDefined();
  expect(res).toHaveLength(25);
});

test('updateShape sends PUT request', async () => {
  const api = new ShapeClient('b2', '/api');
  const shape: ShapeData = { shape: 'rect', x: 0, y: 0, width: 1, height: 1 };
  await api.updateShape('s1', shape);
  const call = (fetch as vi.Mock).mock.calls[0];
  expect(call[0]).toBe('/api/b2/shapes/s1');
  expect(call[1].method).toBe('PUT');
});

test('deleteShape sends DELETE request', async () => {
  const api = new ShapeClient('b3', '/api');
  await api.deleteShape('s2');
  const call = (fetch as vi.Mock).mock.calls[0];
  expect(call[0]).toBe('/api/b3/shapes/s2');
  expect(call[1].method).toBe('DELETE');
});

test('getShape fetches widget', async () => {
  const api = new ShapeClient('b4', '/api');
  (fetch as vi.Mock).mockResolvedValueOnce({
    ok: true,
    json: vi.fn().mockResolvedValue({ id: 's9' }),
  });
  const result = await api.getShape('s9');
  const call = (fetch as vi.Mock).mock.calls[0];
  expect(call[0]).toBe('/api/b4/shapes/s9');
  expect(result).toEqual({ id: 's9' });
});

test('applyOperations posts batch ops', async () => {
  const api = new ShapeClient('b5', '/api');
  (fetch as vi.Mock).mockResolvedValueOnce({
    json: vi.fn().mockResolvedValue({ jobId: 'j1' }),
  });
  const res = await api.applyOperations([{ op: 'create' }], 'key');
  expect((fetch as vi.Mock).mock.calls[0][0]).toBe('/api/b5/ops');
  expect((fetch as vi.Mock).mock.calls[0][1].headers['Idempotency-Key']).toBe(
    'key',
  );
  expect(res).toEqual({ jobId: 'j1' });
});
