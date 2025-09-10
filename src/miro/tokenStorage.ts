import type { ExternalUserId } from '@mirohq/miro-api'
import type { State, Storage } from '@mirohq/miro-api/dist/storage'

// Minimal in-memory store placeholder; replace with Prisma-backed implementation in Phase 3
const mem = new Map<string, State | undefined>()

export class TokenStorage implements Storage {
  async get(userId: ExternalUserId): Promise<State | undefined> {
    return mem.get(String(userId))
  }

  async set(userId: ExternalUserId, state: State | undefined): Promise<void> {
    if (state) mem.set(String(userId), state)
    else mem.delete(String(userId))
  }
}
