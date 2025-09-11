import { afterEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'

import { buildApp } from '../../../src/app.js'
import * as queue from '../../../src/queue/changeQueue.js'

describe('limits route', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns queue size and in-flight counts', async () => {
    vi.spyOn(queue.changeQueue, 'size').mockReturnValue(3 as any)
    vi.spyOn(queue.changeQueue, 'inFlight').mockReturnValue(1 as any)

    const app = await buildApp()
    await app.ready()
    const res = await request(app.server).get('/api/limits')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ queue_length: 3, in_flight: 1, bucket_fill: {} })
    await app.close()
  })
})
