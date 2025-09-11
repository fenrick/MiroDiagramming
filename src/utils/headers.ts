import type { FastifyRequest } from 'fastify'

export const IDEMPOTENCY_KEY_HEADER = 'idempotency-key' as const

/**
 * Extract the `Idempotency-Key` header from a Fastify request.
 * Node.js normalizes header names to lowercase, so we only
 * check the lowercase variant and return the first value if multiple
 * are provided.
 */
export function getIdempotencyKey(req: Pick<FastifyRequest, 'headers'>): string | undefined {
  const value = req.headers[IDEMPOTENCY_KEY_HEADER]
  if (Array.isArray(value)) return value[0]
  return typeof value === 'string' ? value : undefined
}
