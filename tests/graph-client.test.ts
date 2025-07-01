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

  test('encodes unicode share link', async () => {
    (fetch as unknown as vi.Mock).mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(1)),
    });
    const originalBtoa = (globalThis as { btoa?: (s: string) => string }).btoa;
    (globalThis as { btoa?: undefined }).btoa = undefined;
    const link = 'https://миру';
    const encoded = Buffer.from(link, 'utf8')
      .toString('base64')
      .replace(/=+$/, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    await client.fetchFile(link);
    expect((fetch as vi.Mock).mock.calls[0][0]).toBe(
      `https://graph.microsoft.com/v1.0/shares/u!${encoded}/driveItem/content`,
    );
    (globalThis as { btoa?: (s: string) => string }).btoa = originalBtoa;
  });

  test('encodes special characters in share link', async () => {
    (fetch as unknown as vi.Mock).mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(1)),
    });
    const link = 'https://example.com/тест+file/?q=a/b+c';
    const encoded = Buffer.from(link, 'utf8')
      .toString('base64')
      .replace(/=+$/, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    await client.fetchFile(link);
    expect((fetch as vi.Mock).mock.calls[0][0]).toBe(
      `https://graph.microsoft.com/v1.0/shares/u!${encoded}/driveItem/content`,
    );
  });

  test('throws on error', async () => {
    (fetch as unknown as vi.Mock).mockResolvedValue({ ok: false });
    await expect(client.fetchFile('id')).rejects.toThrow(
      'Failed to fetch workbook',
    );
  });
});
