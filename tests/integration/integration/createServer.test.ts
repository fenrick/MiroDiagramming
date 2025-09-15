import { describe, expect, it } from 'vitest'

import { createServer } from '../../../src/server.js'

describe('createServer', () => {
  it('builds app without listening', async () => {
    const { app } = await createServer()
    const res = await app.inject({ method: 'GET', url: '/healthz' })
    expect(res.statusCode).toBe(200)
    await app.close()
  })
})
