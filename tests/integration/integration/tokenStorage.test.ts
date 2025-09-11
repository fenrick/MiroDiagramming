import { describe, expect, it, vi } from 'vitest'

import { TokenStorage } from '../../../src/miro/tokenStorage.js'
import * as db from '../../../src/config/db.js'

describe('TokenStorage', () => {
  it('returns undefined when user not found', async () => {
    const prisma = { user: { findUnique: vi.fn().mockResolvedValue(null) } } as any
    const spy = vi.spyOn(db, 'getPrisma').mockReturnValue(prisma)
    const storage = new TokenStorage()
    const result = await storage.get('123')
    expect(result).toBeUndefined()
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { user_id: '123' } })
    spy.mockRestore()
  })

  it('returns stored state for existing user', async () => {
    const record = {
      user_id: '123',
      access_token: 'token',
      refresh_token: 'refresh',
      expires_at: new Date('2024-01-01T00:00:00Z'),
    }
    const prisma = { user: { findUnique: vi.fn().mockResolvedValue(record) } } as any
    const spy = vi.spyOn(db, 'getPrisma').mockReturnValue(prisma)
    const storage = new TokenStorage()
    const result = await storage.get('123')
    expect(result).toEqual({
      userId: '123',
      accessToken: 'token',
      refreshToken: 'refresh',
      tokenExpiresAt: record.expires_at.toISOString(),
    })
    spy.mockRestore()
  })

  it('deletes state when undefined provided', async () => {
    const deleteFn = vi.fn().mockResolvedValue(undefined)
    const prisma = { user: { delete: deleteFn } } as any
    const spy = vi.spyOn(db, 'getPrisma').mockReturnValue(prisma)
    const storage = new TokenStorage()
    await storage.set('123', undefined)
    expect(deleteFn).toHaveBeenCalledWith({ where: { user_id: '123' } })
    spy.mockRestore()
  })

  it('upserts state when provided', async () => {
    const upsertFn = vi.fn().mockResolvedValue(undefined)
    const prisma = { user: { upsert: upsertFn } } as any
    const spy = vi.spyOn(db, 'getPrisma').mockReturnValue(prisma)
    const storage = new TokenStorage()
    const state = {
      userId: 'u1',
      accessToken: 'token',
      refreshToken: 'refresh',
      tokenExpiresAt: '2024-01-01T00:00:00.000Z',
    }
    await storage.set('u1', state)
    expect(upsertFn).toHaveBeenCalledWith({
      where: { user_id: 'u1' },
      update: {
        access_token: 'token',
        refresh_token: 'refresh',
        expires_at: new Date(state.tokenExpiresAt),
        name: state.userId,
      },
      create: {
        user_id: 'u1',
        name: state.userId,
        access_token: 'token',
        refresh_token: 'refresh',
        expires_at: new Date(state.tokenExpiresAt),
      },
    })
    spy.mockRestore()
  })
})
