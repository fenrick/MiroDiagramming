import { describe, expect, it, vi } from 'vitest'

import { IdempotencyRepo } from '../../../src/repositories/idempotencyRepo.js'
import * as db from '../../../src/config/db.js'

describe('IdempotencyRepo', () => {
  it('removes entries older than ttl', async () => {
    vi.useFakeTimers()
    const now = new Date('2024-01-01T00:00:00Z')
    vi.setSystemTime(now)
    const deleteMany = vi.fn().mockResolvedValue({ count: 2 })
    const prisma = { idempotencyEntry: { deleteMany } } as any
    const spy = vi.spyOn(db, 'getPrisma').mockReturnValue(prisma)
    const repo = new IdempotencyRepo()
    const count = await repo.cleanup(3600)
    expect(deleteMany).toHaveBeenCalledWith({
      where: { created_at: { lt: new Date(now.getTime() - 3600 * 1000) } },
    })
    expect(count).toBe(2)
    spy.mockRestore()
    vi.useRealTimers()
  })
})
