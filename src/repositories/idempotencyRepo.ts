import { getPrisma } from '../config/db.js'

export class IdempotencyRepo {
  async get(key: string): Promise<number | undefined> {
    const prisma = getPrisma()
    const row = await prisma.idempotencyEntry.findUnique({ where: { key } })
    return row?.accepted ?? undefined
  }

  async set(key: string, accepted: number): Promise<void> {
    const prisma = getPrisma()
    await prisma.idempotencyEntry.upsert({
      where: { key },
      update: { accepted },
      create: { key, accepted },
    })
  }
}
