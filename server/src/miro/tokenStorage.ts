export interface MiroState {
  accessToken: string
  refreshToken?: string
  expiresAt?: number
  scope?: string
  tokenType?: string
}

// Minimal in-memory store placeholder; replace with Prisma-backed implementation in Phase 3
const mem = new Map<string, MiroState>()

export class TokenStorage {
  async get(userId: string): Promise<MiroState | undefined> {
    return mem.get(userId)
  }

  async set(userId: string, state: MiroState): Promise<void> {
    mem.set(userId, state)
  }
}

