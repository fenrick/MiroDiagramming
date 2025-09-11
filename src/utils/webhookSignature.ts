import crypto from 'node:crypto'

/**
 * Verify a Miro webhook signature using HMAC-SHA256 over the raw request body.
 *
 * The `X-Miro-Signature` header contains the hex-encoded HMAC of the raw body.
 * This function recomputes the signature and compares it using
 * `crypto.timingSafeEqual` to avoid timing attacks.
 *
 * @param raw - Raw request body provided by fastify-raw-body.
 * @param secret - Shared secret configured via `MIRO_WEBHOOK_SECRET`.
 * @param signature - Hex-encoded signature from the request header.
 * @returns `true` when the signature matches.
 */
export function verifyWebhookSignature(
  raw: string | Buffer,
  secret: string,
  signature: string,
): boolean {
  const expectedHex = crypto.createHmac('sha256', secret).update(raw).digest('hex')
  const sigBuf = Buffer.from(signature, 'hex')
  const expBuf = Buffer.from(expectedHex, 'hex')
  return sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf)
}
