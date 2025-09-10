import { beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import crypto from 'node:crypto'

import { buildApp } from '../../../src/app.js'
import { webhookQueue } from '../../../src/queue/webhookQueue.js'

const secret = 'test-webhook-secret'

function sign(body: object) {
  return crypto.createHmac('sha256', secret).update(JSON.stringify(body)).digest('hex')
}

describe('webhook route', () => {
  beforeEach(() => {
    process.env.MIRO_WEBHOOK_SECRET = secret
    webhookQueue.clear()
  })

  it('enqueues payload when signature valid', async () => {
    const app = await buildApp()
    await app.ready()
    const payload = { events: [{ event: 'created', data: { x: 1 } }] }
    const res = await request(app.server)
      .post('/api/webhook')
      .set('X-Miro-Signature', sign(payload))
      .send(payload)
    expect(res.status).toBe(202)
    expect(webhookQueue.size()).toBe(1)
    expect(webhookQueue.take()).toEqual(payload)
    await app.close()
  })

  it('rejects missing signature', async () => {
    const app = await buildApp()
    await app.ready()
    const res = await request(app.server).post('/api/webhook').send({ events: [] })
    expect(res.status).toBe(401)
    expect(webhookQueue.size()).toBe(0)
    await app.close()
  })

  it('rejects bad signature', async () => {
    const app = await buildApp()
    await app.ready()
    const res = await request(app.server)
      .post('/api/webhook')
      .set('X-Miro-Signature', 'bad')
      .send({ events: [] })
    expect(res.status).toBe(401)
    expect(webhookQueue.size()).toBe(0)
    await app.close()
  })

  it('validates payload shape', async () => {
    const app = await buildApp()
    await app.ready()
    const bad = { foo: 'bar' }
    const res = await request(app.server)
      .post('/api/webhook')
      .set('X-Miro-Signature', sign(bad))
      .send(bad)
    expect(res.status).toBe(400)
    expect(webhookQueue.size()).toBe(0)
    await app.close()
  })
})
