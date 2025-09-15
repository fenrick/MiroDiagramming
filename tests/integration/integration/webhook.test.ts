import crypto from 'node:crypto'

import { beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'

import { buildApp } from '../../../src/app.js'
import { webhookQueue } from '../../../src/queue/webhookQueue.js'

const secret = 'test-webhook-secret'

function sign(body: object | string) {
  const payload = typeof body === 'string' ? body : JSON.stringify(body)
  return crypto.createHmac('sha256', secret).update(payload).digest('hex')
}

describe('webhook route', () => {
  beforeEach(() => {
    process.env.MIRO_WEBHOOK_SECRET = secret
    webhookQueue.clear()
  })

  it('enqueues payload when signature valid', async () => {
    const app = await buildApp()
    await app.ready()
    const obj = { events: [{ event: 'created', data: { x: 1 } }] }
    const raw = `${JSON.stringify(obj)} `
    const res = await request(app.server)
      .post('/api/webhook')
      .set('Content-Type', 'application/json')
      .set('X-Miro-Signature', sign(raw))
      .send(raw)
    expect(res.status).toBe(202)
    expect(webhookQueue.size()).toBe(1)
    expect(webhookQueue.take()).toEqual(obj)
    await app.close()
  })

  it('rejects missing signature', async () => {
    const app = await buildApp()
    await app.ready()
    const res = await request(app.server).post('/api/webhook').send({ events: [] })
    expect(res.status).toBe(401)
    expect(res.body).toEqual({
      error: { message: 'Invalid signature', code: 'INVALID_SIGNATURE' },
    })
    expect(webhookQueue.size()).toBe(0)
    await app.close()
  })

  it('rejects bad signature', async () => {
    const app = await buildApp()
    await app.ready()
    const obj = { events: [] }
    const raw = `${JSON.stringify(obj)} `
    const res = await request(app.server)
      .post('/api/webhook')
      .set('Content-Type', 'application/json')
      .set('X-Miro-Signature', sign(obj))
      .send(raw)
    expect(res.status).toBe(401)
    expect(res.body).toEqual({
      error: { message: 'Invalid signature', code: 'INVALID_SIGNATURE' },
    })
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
    expect(res.body).toEqual({
      error: { message: 'Invalid payload', code: 'INVALID_PAYLOAD' },
    })
    expect(webhookQueue.size()).toBe(0)
    await app.close()
  })

  it('rejects unsupported content type', async () => {
    const app = await buildApp()
    await app.ready()
    const raw = ''
    const res = await app.inject({
      method: 'POST',
      url: '/api/webhook',
      headers: {
        'Content-Type': 'text/plain',
        'X-Miro-Signature': sign(raw),
      },
      payload: Buffer.alloc(0),
    })
    expect(res.statusCode).toBe(415)
    expect(res.json()).toEqual({
      error: { message: 'Unsupported content type', code: 'UNSUPPORTED_MEDIA_TYPE' },
    })
    expect(webhookQueue.size()).toBe(0)
    await app.close()
  })

  it('rejects payloads over the size limit', async () => {
    const app = await buildApp()
    await app.ready()
    const big = 'x'.repeat(2000)
    const obj = { events: [{ event: 'created', data: { big } }] }
    const raw = JSON.stringify(obj)
    const res = await request(app.server)
      .post('/api/webhook')
      .set('Content-Type', 'application/json')
      .set('X-Miro-Signature', sign(raw))
      .send(raw)
    expect(res.status).toBe(413)
    expect(webhookQueue.size()).toBe(0)
    await app.close()
  })
})
