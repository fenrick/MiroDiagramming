import { afterEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'

import { buildApp } from '../../../src/app.js'
import * as db from '../../../src/config/db.js'

describe('cache route', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns parsed JSON when value is JSON', async () => {
    const prisma = {
      cacheEntry: {
        findUnique: vi.fn().mockResolvedValue({ key: 'b1', value: JSON.stringify({ a: 1 }) }),
      },
    } as any
    vi.spyOn(db, 'getPrisma').mockReturnValue(prisma)

    const app = await buildApp()
    await app.ready()
    const res = await request(app.server).get('/api/cache/b1')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ a: 1 })
    await app.close()
  })

  it('returns raw string when value is not JSON', async () => {
    const prisma = {
      cacheEntry: {
        findUnique: vi.fn().mockResolvedValue({ key: 'b1', value: 'hello' }),
      },
    } as any
    vi.spyOn(db, 'getPrisma').mockReturnValue(prisma)

    const app = await buildApp()
    await app.ready()
    const res = await request(app.server).get('/api/cache/b1')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ value: 'hello' })
    await app.close()
  })
})
