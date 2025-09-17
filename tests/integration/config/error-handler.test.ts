import { afterEach, describe, expect, it } from 'vitest'
import Fastify from 'fastify'

import { registerErrorHandler } from '../../../src/config/error-handler.js'
import { BadRequestError } from '../../../src/config/domain-errors.js'

describe('error-handler', () => {
  afterEach(async () => {
    // no global state to reset
  })

  it('maps validation errors to INVALID_PAYLOAD', async () => {
    const app = Fastify({ logger: false })
    registerErrorHandler(app)
    app.post(
      '/test',
      {
        schema: {
          body: { type: 'object', properties: { a: { type: 'number' } }, required: ['a'] },
        },
      },
      async () => ({ ok: true }),
    )
    const res = await app.inject({ method: 'POST', url: '/test', payload: {} })
    expect(res.statusCode).toBe(400)
    expect(res.json()).toEqual({ error: { message: 'Invalid payload', code: 'INVALID_PAYLOAD' } })
    await app.close()
  })

  it('returns custom status and code for non-validation errors', async () => {
    const app = Fastify({ logger: false })
    registerErrorHandler(app)
    app.get('/boom', async () => {
      const err = new Error('boom') as any
      err.statusCode = 418
      err.code = 'TEAPOT'
      throw err
    })
    const res = await app.inject({ method: 'GET', url: '/boom' })
    expect(res.statusCode).toBe(418)
    expect(res.json()).toEqual({ error: { message: 'boom', code: 'TEAPOT' } })
    await app.close()
  })

  it('maps domain errors to configured status and code', async () => {
    const app = Fastify({ logger: false })
    registerErrorHandler(app)
    app.get('/domain', async () => {
      throw new BadRequestError('bad', 'BAD_INPUT')
    })
    const res = await app.inject({ method: 'GET', url: '/domain' })
    expect(res.statusCode).toBe(400)
    expect(res.json()).toEqual({ error: { message: 'bad', code: 'BAD_INPUT' } })
    await app.close()
  })
})
