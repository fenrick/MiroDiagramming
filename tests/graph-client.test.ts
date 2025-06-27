import { GraphClient } from '../src/core/utils/graph-client';
import { GraphAuth } from '../src/core/utils/graph-auth';

vi.stubGlobal('fetch', vi.fn());

describe('GraphClient', () => {
  const auth = new GraphAuth();
  const client = new GraphClient(auth);

  beforeEach(() => {
    (fetch as unknown as vi.Mock).mockReset();
    auth.setToken('token');
  });

  test('builds url from id', async () => {
    (fetch as unknown as vi.Mock).mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(1)),
    });
    await client.fetchFile('123');
    expect((fetch as vi.Mock).mock.calls[0][0]).toMatch(
      /me\/drive\/items\/123\/content/,
    );
    expect((fetch as vi.Mock).mock.calls[0][1].headers.Authorization).toBe(
      'Bearer token',
    );
  });

  test('builds url from share link', async () => {
    (fetch as unknown as vi.Mock).mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(1)),
    });
    await client.fetchFile('https://x');
    expect((fetch as vi.Mock).mock.calls[0][0]).toMatch(/shares\/u!/);
  });

  test('throws on error', async () => {
    (fetch as unknown as vi.Mock).mockResolvedValue({ ok: false });
    await expect(client.fetchFile('id')).rejects.toThrow(
      'Failed to fetch workbook',
    );
  });
});
