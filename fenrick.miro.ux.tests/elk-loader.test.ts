import { loadElk } from 'fenrick.miro.ux/core/layout/elk-loader';
import ELK from 'elkjs/lib/elk.bundled.js';

/** Tests for the dynamic ELK loader. */
describe('loadElk', () => {
  test('returns the local ELK class when running in Node', async () => {
    const mod = await loadElk();
    expect(mod).toBe(ELK);
    expect(typeof mod).toBe('function');
  });

  test('caches subsequent calls', async () => {
    const first = await loadElk();
    const second = await loadElk();
    expect(first).toBe(second);
  });
});
