import { describe, expect, it } from 'vitest'
import Fastify from 'fastify'

import { registerSpaFallback } from '../../../src/utils/spaFallback.js'

describe('registerSpaFallback', () => {
  it('returns 404 JSON for API routes and serves index otherwise', async () => {
    const app = Fastify()
    let served = 0
    registerSpaFallback(app as any, async (_req, reply) => {
      served += 1
      return reply.send('index')
    })

    const notFound = await app.inject({ method: 'GET', url: '/api/unknown' })
    expect(notFound.statusCode).toBe(404)
    expect(JSON.parse(notFound.body)).toEqual({
      error: { message: 'Not found', code: 'NOT_FOUND' },
    })

    const indexRes = await app.inject({ method: 'GET', url: '/something' })
    expect(indexRes.statusCode).toBe(200)
    expect(indexRes.body).toBe('index')
    expect(served).toBe(1)
    await app.close()
  })
})
