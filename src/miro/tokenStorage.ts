import type { ExternalUserId } from '@mirohq/miro-api'
import type { State, Storage } from '@mirohq/miro-api/dist/storage'

import { getPrisma } from '../config/db.js'

/**
 * TokenStorage implementation bridging Miro's Storage interface to Prisma `User` records.
 *
 * Fields mapping:
 * - userId -> `user.user_id`
 * - accessToken -> `user.access_token`
 * - refreshToken -> `user.refresh_token`
 * - tokenExpiresAt (ISO) -> `user.expires_at` (Date)
 *
 * Passing `undefined` to `set` removes the user state.
 */

export class TokenStorage implements Storage {
  async get(userId: ExternalUserId): Promise<State | undefined> {
    const prisma = getPrisma()
    const record = await prisma.user.findUnique({ where: { user_id: String(userId) } })
    if (!record) return undefined
    return {
      userId: record.user_id,
      accessToken: record.access_token,
      refreshToken: record.refresh_token ?? undefined,
      tokenExpiresAt: record.expires_at?.toISOString(),
    }
  }

  async set(userId: ExternalUserId, state: State | undefined): Promise<void> {
    const prisma = getPrisma()
    if (!state) {
      await prisma.user.delete({ where: { user_id: String(userId) } }).catch(() => {})
      return
    }
    await prisma.user.upsert({
      where: { user_id: String(userId) },
      update: {
        access_token: state.accessToken,
        refresh_token: state.refreshToken ?? '',
        expires_at: state.tokenExpiresAt ? new Date(state.tokenExpiresAt) : new Date(),
        name: state.userId,
      },
      create: {
        user_id: String(userId),
        name: state.userId,
        access_token: state.accessToken,
        refresh_token: state.refreshToken ?? '',
        expires_at: state.tokenExpiresAt ? new Date(state.tokenExpiresAt) : new Date(),
      },
    })
  }
}
