import { afterEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'

import { buildApp } from '../../../src/app.js'
import { IdempotencyRepo } from '../../../src/repositories/idempotencyRepo.js'

describe('cards idempotency', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns previous accepted count when idem key exists', async () => {
    vi.spyOn(IdempotencyRepo.prototype, 'get').mockResolvedValue(3 as any)
    const app = await buildApp()
    await app.ready()
    const res = await request(app.server)
      .post('/api/cards')
      .set('Idempotency-Key', 'abc')
      .send([{ title: 'x' }])
    expect(res.status).toBe(202)
    expect(res.body).toEqual({ accepted: 3 })
    await app.close()
  })

  it('stores accepted count for new idem key', async () => {
    const getSpy = vi.spyOn(IdempotencyRepo.prototype, 'get').mockResolvedValue(undefined as any)
    const setSpy = vi.spyOn(IdempotencyRepo.prototype, 'set').mockResolvedValue(undefined as any)
    const app = await buildApp()
    await app.ready()
    const res = await request(app.server)
      .post('/api/cards')
      .set('Idempotency-Key', 'new')
      .send([{ title: 'x' }, { title: 'y' }])
    expect(res.status).toBe(202)
    expect(res.body).toEqual({ accepted: 2 })
    expect(getSpy).toHaveBeenCalledWith('new')
    expect(setSpy).toHaveBeenCalledWith('new', 2)
    await app.close()
  })

  it('returns 202 with zero accepted when empty array provided and stores zero if idem key', async () => {
    const setSpy = vi.spyOn(IdempotencyRepo.prototype, 'set').mockResolvedValue(undefined as any)
    const app = await buildApp()
    await app.ready()
    const res = await request(app.server).post('/api/cards').set('Idempotency-Key', 'zero').send([])
    expect(res.status).toBe(202)
    expect(res.body).toEqual({ accepted: 0 })
    expect(setSpy).toHaveBeenCalledWith('zero', 0)
    await app.close()
  })
})
