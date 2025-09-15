import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { createServer } from '../../../src/server.js'

const originalEnv = process.env.NODE_ENV

describe('helmet', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'development'
  })

  afterEach(() => {
    process.env.NODE_ENV = originalEnv
  })

  it('applies security headers', async () => {
    const { app } = await createServer()
    const res = await app.inject({ method: 'GET', url: '/api' })
    expect(res.headers['x-frame-options']).toBe('SAMEORIGIN')
    expect(res.headers['x-content-type-options']).toBe('nosniff')
    await app.close()
  })
})
