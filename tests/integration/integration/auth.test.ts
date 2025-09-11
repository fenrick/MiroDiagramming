import { afterEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'

import { buildApp } from '../../../src/app.js'
import * as miroClient from '../../../src/miro/miroClient.js'

describe('auth routes', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('redirects to provider on login', async () => {
    const fake = {
      getAuthUrl: () => 'https://miro.test/auth',
      isAuthorized: vi.fn(),
      exchangeCodeForAccessToken: vi.fn(),
      as: vi.fn(),
    } as any
    vi.spyOn(miroClient, 'getMiro').mockReturnValue(fake)

    const app = await buildApp()
    await app.ready()
    const res = await request(app.server).get('/auth/miro/login')
    expect(res.status).toBe(302)
    expect(res.headers.location).toBe('https://miro.test/auth')
    await app.close()
  })

  it('handles oauth callback and redirects to root', async () => {
    const fake = {
      getAuthUrl: () => 'https://miro.test/auth',
      isAuthorized: vi.fn(),
      exchangeCodeForAccessToken: vi.fn().mockResolvedValue(undefined),
      as: vi.fn(),
    } as any
    const spy = vi.spyOn(miroClient, 'getMiro').mockReturnValue(fake)

    const app = await buildApp()
    await app.ready()
    const res = await request(app.server).get('/auth/miro/callback?code=abc')
    expect(res.status).toBe(302)
    expect(spy).toHaveBeenCalled()
    expect(fake.exchangeCodeForAccessToken).toHaveBeenCalled()
    await app.close()
  })

  it('returns 400 on missing oauth code', async () => {
    const fake = {
      getAuthUrl: () => 'https://miro.test/auth',
      isAuthorized: vi.fn(),
      exchangeCodeForAccessToken: vi.fn(),
      as: vi.fn(),
    } as any
    vi.spyOn(miroClient, 'getMiro').mockReturnValue(fake)

    const app = await buildApp()
    await app.ready()
    const res = await request(app.server).get('/auth/miro/callback')
    expect(res.status).toBe(400)
    expect(res.body).toEqual({
      error: { message: 'Missing code', code: 'MISSING_CODE' },
    })
    await app.close()
  })

  it('exposes auth status', async () => {
    const fake = {
      getAuthUrl: () => 'https://miro.test/auth',
      isAuthorized: vi.fn().mockResolvedValueOnce(true).mockResolvedValueOnce(false),
      exchangeCodeForAccessToken: vi.fn(),
      as: vi.fn(),
    } as any
    vi.spyOn(miroClient, 'getMiro').mockReturnValue(fake)

    const app = await buildApp()
    await app.ready()
    let res = await request(app.server).get('/api/auth/status')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ authorized: true })

    res = await request(app.server).get('/api/auth/status')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ authorized: false })
    await app.close()
  })
})
