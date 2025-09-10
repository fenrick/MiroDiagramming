import type {
  FastifyError,
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
} from 'fastify'

import type { Logger } from './logger.js'

/**
 * Registers a global error handler that logs the error and returns a
 * structured response body. All errors are logged with the request
 * context and a JSON payload `{ error: { message } }` is sent to the
 * client.
 */
export function registerErrorHandler(
  app: FastifyInstance<
    RawServerDefault,
    RawRequestDefaultExpression,
    RawReplyDefaultExpression,
    Logger
  >,
) {
  app.setErrorHandler(function (error: FastifyError, request: FastifyRequest, reply: FastifyReply) {
    request.log.error({ err: error }, 'request failed')
    const status = error.statusCode ?? 500
    reply.status(status).send({ error: { message: error.message } })
  })
}
