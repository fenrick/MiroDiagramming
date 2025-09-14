import { describe, expect, it } from 'vitest'
import request from 'supertest'

import { startServer } from '../../../src/server.js'

describe('server', () => {
  it('starts and serves health check', async () => {
    const app = await startServer(0)
    const res = await request(app.server).get('/healthz')
    expect(res.status).toBe(200)
    await app.close()
  })
})
