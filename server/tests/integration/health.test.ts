import { describe, expect, it } from 'vitest'
import request from 'supertest'

import { buildApp } from '../../src/app.js'

describe('health route', () => {
  it('returns ok', async () => {
    const app = await buildApp()
    await app.ready()
    const res = await request(app.server).get('/healthz')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'ok' })
    await app.close()
  })
})
