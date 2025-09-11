import crypto from 'node:crypto'

import type { FastifyPluginAsync } from 'fastify'

import { webhookQueue } from '../queue/webhookQueue.js'
import type { WebhookPayload } from '../queue/webhookTypes.js'
import { errorResponse } from '../config/error-response.js'
import { loadEnv } from '../config/env.js'

const webhookEventSchema = {
  type: 'object',
  properties: {
    event: { type: 'string' },
    data: { type: 'object', additionalProperties: true },
  },
  required: ['event', 'data'],
  additionalProperties: false,
} as const

const webhookPayloadSchema = {
  type: 'object',
  properties: {
    events: { type: 'array', items: webhookEventSchema },
  },
  required: ['events'],
  additionalProperties: false,
} as const

export const registerWebhookRoutes: FastifyPluginAsync = async (app) => {
  app.post<{ Body: WebhookPayload }>(
    '/api/webhook',
    {
      config: { rawBody: true },
      schema: {
        body: webhookPayloadSchema,
        response: {
          202: {
            type: 'object',
            properties: { accepted: { type: 'boolean' } },
            required: ['accepted'],
          },
          401: {
            type: 'object',
            properties: {
              error: {
                type: 'object',
                properties: { message: { type: 'string' }, code: { type: 'string' } },
                required: ['message', 'code'],
              },
            },
            required: ['error'],
          },
        },
      },
      preValidation: async (req, reply) => {
        const { MIRO_WEBHOOK_SECRET: secret } = loadEnv()
        const signature = req.headers['x-miro-signature'] as string | undefined
        if (!secret || !signature) {
          return reply.code(401).send(errorResponse('Invalid signature', 'INVALID_SIGNATURE'))
        }
        const rawBody = (req as unknown as { rawBody?: Buffer | string }).rawBody
        const raw =
          typeof rawBody === 'string' || Buffer.isBuffer(rawBody)
            ? rawBody
            : JSON.stringify(req.body)
        const expectedHex = crypto.createHmac('sha256', secret).update(raw).digest('hex')
        const sigBuf = Buffer.from(signature, 'hex')
        const expBuf = Buffer.from(expectedHex, 'hex')
        if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
          return reply.code(401).send(errorResponse('Invalid signature', 'INVALID_SIGNATURE'))
        }
        return undefined
      },
    },
    async (req, reply) => {
      webhookQueue.enqueue(req.body)
      return reply.code(202).send({ accepted: true })
    },
  )
}
