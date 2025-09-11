import { describe, expect, it } from 'vitest'

import { withMiroRetry } from '../../../src/miro/retry.js'

describe('withMiroRetry', () => {
  it('retries on 5xx and eventually succeeds', async () => {
    let calls = 0
    const fn = async () => {
      calls += 1
      if (calls < 3) {
        throw { status: 500 }
      }
      return 'ok'
    }
    const result = await withMiroRetry(fn, 3, 1)
    expect(result).toBe('ok')
    expect(calls).toBe(3)
  })

  it('does not retry on non-retriable errors', async () => {
    const fn = async () => {
      throw { status: 400 }
    }
    await expect(withMiroRetry(fn, 3, 1)).rejects.toBeDefined()
  })
})
