import type { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

import { DomainError } from './domain-errors.js'
import { errorResponse } from './error-response.js'

/**
 * Registers a global error handler that logs the error and returns a
 * structured response body. All errors are logged with the request
 * context and a JSON payload `{ error: { message, code? } }` is sent to
 * the client.
 */
export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler(function (error: FastifyError, request: FastifyRequest, reply: FastifyReply) {
    request.log.error({ err: error }, 'request failed')
    if (error instanceof DomainError) {
      reply.status(error.statusCode).send(errorResponse(error.message, error.code))
      return
    }

    const status = error.statusCode ?? 500
    let message = error.message
    let code: string | undefined
    if ((error as { code?: string }).code === 'FST_ERR_VALIDATION') {
      message = 'Invalid payload'
      code = 'INVALID_PAYLOAD'
    } else if (typeof (error as { code?: unknown }).code === 'string') {
      code = (error as { code: string }).code
    }
    reply.status(status).send(errorResponse(message, code))
  })
}
