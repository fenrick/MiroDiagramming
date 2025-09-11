import crypto from 'node:crypto'
import { describe, expect, it } from 'vitest'

import { verifyWebhookSignature } from '../../../src/utils/webhookSignature.js'

const secret = 'test-webhook-secret'

function sign(raw: string | Buffer) {
  return crypto.createHmac('sha256', secret).update(raw).digest('hex')
}

describe('verifyWebhookSignature', () => {
  it('accepts matching signature', () => {
    const raw = Buffer.from('payload')
    const sig = sign(raw)
    expect(verifyWebhookSignature(raw, secret, sig)).toBe(true)
  })

  it('rejects mismatched signature', () => {
    const raw = Buffer.from('payload')
    const sig = sign('other')
    expect(verifyWebhookSignature(raw, secret, sig)).toBe(false)
  })

  it('rejects signature with wrong length', () => {
    const raw = 'payload'
    const sig = sign(raw).slice(2)
    expect(verifyWebhookSignature(raw, secret, sig)).toBe(false)
  })
})
