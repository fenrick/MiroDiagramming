import ELK from 'elkjs/lib/elk.bundled.js'
import { loadElk } from '../src/core/layout/elk-loader'

/** Tests for the dynamic ELK loader. */
describe('loadElk', () => {
  test('returns the local ELK class when running in Node', async () => {
    const mod = await loadElk()
    expect(mod).toBe(ELK)
    expect(typeof mod).toBe('function')
  })

  test('caches subsequent calls', async () => {
    const first = await loadElk()
    const second = await loadElk()
    expect(first).toBe(second)
  })
})
