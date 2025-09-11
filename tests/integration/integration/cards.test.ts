import { beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'

import { buildApp } from '../../../src/app.js'

describe('cards route', () => {
  beforeEach(() => {
    // no-op; ensure side effects from previous tests are isolated
  })

  it('accepts valid payload', async () => {
    const app = await buildApp()
    await app.ready()
    const res = await request(app.server)
      .post('/api/cards')
      .send([{ title: 'ok' }])
    expect(res.status).toBe(202)
    expect(res.body).toEqual({ accepted: 1 })
    await app.close()
  })

  it('rejects invalid payload', async () => {
    const app = await buildApp()
    await app.ready()
    const res = await request(app.server).post('/api/cards').send({ title: 'ok' })
    expect(res.status).toBe(400)
    expect(res.body).toEqual({
      error: { message: 'Invalid payload', code: 'INVALID_PAYLOAD' },
    })
    await app.close()
  })
})
