import { afterEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'

import { buildApp } from '../../../src/app.js'
import * as db from '../../../src/config/db.js'

describe('tags route', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns empty array when board not found', async () => {
    const prisma = {
      board: { findFirst: vi.fn().mockResolvedValue(null) },
      tag: { findMany: vi.fn() },
    } as any
    vi.spyOn(db, 'getPrisma').mockReturnValue(prisma)
    const app = await buildApp()
    await app.ready()
    const res = await request(app.server).get('/api/boards/unknown/tags')
    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
    await app.close()
  })

  it('resolves board by string board_id and returns mapped tags', async () => {
    const prisma = {
      board: { findFirst: vi.fn().mockResolvedValue({ id: 1, board_id: 'b1' }) },
      tag: {
        findMany: vi.fn().mockResolvedValue([
          { id: 2, name: 'A' },
          { id: 3, name: 'B' },
        ]),
      },
    } as any
    vi.spyOn(db, 'getPrisma').mockReturnValue(prisma)
    const app = await buildApp()
    await app.ready()
    const res = await request(app.server).get('/api/boards/b1/tags')
    expect(res.status).toBe(200)
    expect(res.body).toEqual([
      { id: '2', title: 'A' },
      { id: '3', title: 'B' },
    ])
    await app.close()
  })

  it('resolves board by numeric id', async () => {
    const prisma = {
      board: { findFirst: vi.fn().mockResolvedValue({ id: 42, board_id: 'ignored' }) },
      tag: { findMany: vi.fn().mockResolvedValue([]) },
    } as any
    const spy = vi.spyOn(db, 'getPrisma').mockReturnValue(prisma)
    const app = await buildApp()
    await app.ready()
    const res = await request(app.server).get('/api/boards/42/tags')
    expect(res.status).toBe(200)
    expect(spy).toHaveBeenCalled()
    await app.close()
  })
})
