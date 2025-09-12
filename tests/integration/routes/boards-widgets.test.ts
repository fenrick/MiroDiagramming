import { afterEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'

import { buildApp } from '../../../src/app.js'
import { MiroService } from '../../../src/services/miroService.js'

describe('board widgets route', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns widgets grouped by type', async () => {
    vi.spyOn(MiroService.prototype, 'getWidgets').mockResolvedValue({
      shape: [{ id: 1 }],
    })
    const app = await buildApp()
    await app.ready()
    const res = await request(app.server).get('/api/boards/b1/widgets?types=shape')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ shape: [{ id: 1 }] })
    await app.close()
  })
})
