import crypto from 'node:crypto'

import type { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'

import { webhookQueue } from '../queue/webhookQueue.js'
import type { WebhookPayload } from '../queue/webhookTypes.js'

const WebhookEvent = z.object({
  event: z.string(),
  data: z.record(z.unknown()),
})
const WebhookPayloadSchema = z.object({ events: z.array(WebhookEvent) })

export const registerWebhookRoutes: FastifyPluginAsync = async (app) => {
  app.post('/api/webhook', { config: { rawBody: true } }, async (req, reply) => {
    const secret = process.env.MIRO_WEBHOOK_SECRET
    const signature = req.headers['x-miro-signature'] as string | undefined
    if (!secret || !signature) {
      return reply.code(401).send({ error: 'Invalid signature' })
    }
    const body = req.body as unknown
    const rawBody = (req as unknown as { rawBody?: Buffer | string }).rawBody
    const raw = typeof rawBody === 'string' || Buffer.isBuffer(rawBody) ? rawBody : JSON.stringify(body)
    const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex')
    if (expected !== signature) {
      return reply.code(401).send({ error: 'Invalid signature' })
    }
    const parsed = WebhookPayloadSchema.safeParse(body)
    if (!parsed.success) {
      return reply.code(400).send({ error: 'Invalid payload' })
    }
    webhookQueue.enqueue(parsed.data as WebhookPayload)
    return reply.code(202).send({ accepted: true })
  })
}
