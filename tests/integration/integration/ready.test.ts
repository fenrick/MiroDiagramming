import { describe, expect, it, vi } from 'vitest'
import request from 'supertest'

import { buildApp } from '../../../src/app.js'
import { changeQueue } from '../../../src/queue/changeQueue.js'
import * as db from '../../../src/config/db.js'

describe('ready route', () => {
  it('returns ok when dependencies are ready', async () => {
    const prisma = { $queryRaw: vi.fn().mockResolvedValue(1) } as unknown
    const prismaSpy = vi.spyOn(db, 'getPrisma').mockReturnValue(prisma as any)
    const app = await buildApp()
    await app.ready()
    const res = await request(app.server).get('/readyz')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'ok' })
    prismaSpy.mockRestore()
    await app.close()
  })

  it('returns 503 when queue is not idle', async () => {
    const app = await buildApp()
    await app.ready()
    const sizeSpy = vi.spyOn(changeQueue, 'size').mockReturnValue(1)
    const res = await request(app.server).get('/readyz')
    expect(res.status).toBe(503)
    sizeSpy.mockRestore()
    await app.close()
  })

  it('returns 503 when database is unreachable', async () => {
    const prisma = { $queryRaw: vi.fn().mockRejectedValue(new Error('fail')) } as unknown
    const prismaSpy = vi.spyOn(db, 'getPrisma').mockReturnValue(prisma as any)
    const app = await buildApp()
    await app.ready()
    const res = await request(app.server).get('/readyz')
    expect(res.status).toBe(503)
    prismaSpy.mockRestore()
    await app.close()
  })
})
