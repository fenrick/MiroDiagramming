import 'fastify'

declare module 'fastify' {
  interface FastifyRequest {
    /** Stable user identifier set via preHandler hook */
    userId: string
  }
}
