import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'

import { buildApp } from '../../../src/app.js'

let app: Awaited<ReturnType<typeof buildApp>>

describe('cors and cookies', () => {
  beforeAll(async () => {
    process.env.CORS_ORIGINS = '["https://allowed.test"]'
    process.env.NODE_ENV = 'production'
    app = await buildApp()
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
    delete process.env.CORS_ORIGINS
    process.env.NODE_ENV = 'test'
  })

  it('allows configured origin and sets secure cookie', async () => {
    const res = await request(app.server).get('/api').set('Origin', 'https://allowed.test')
    expect(res.headers['access-control-allow-origin']).toBe('https://allowed.test')
    const cookie = res.headers['set-cookie']?.[0] ?? ''
    expect(cookie).toContain('Secure')
    expect(cookie).toContain('SameSite=Strict')
  })

  it('blocks unconfigured origin', async () => {
    const res = await request(app.server).get('/api').set('Origin', 'https://denied.test')
    expect(res.headers['access-control-allow-origin']).toBeUndefined()
  })
})
