import type { FastifyPluginAsync } from 'fastify'

import { getPrisma } from '../config/db.js'

interface BoardTagsParams {
  boardId: string
}

const boardTagsParamsSchema = {
  type: 'object',
  properties: { boardId: { type: 'string' } },
  required: ['boardId'],
  additionalProperties: false,
} as const

const tagsResponseSchema = {
  type: 'array',
  items: {
    type: 'object',
    properties: { id: { type: 'string' }, title: { type: 'string' } },
    required: ['id', 'title'],
    additionalProperties: false,
  },
} as const

export const registerTagsRoutes: FastifyPluginAsync = async (app) => {
  app.get<{ Params: BoardTagsParams }>(
    '/api/boards/:boardId/tags',
    {
      schema: {
        params: boardTagsParamsSchema,
        response: { 200: tagsResponseSchema },
      },
    },
    async (req, reply) => {
      const prisma = getPrisma()
      const boardParam = req.params.boardId
      // Resolve either by external board_id (string) or internal id (number)
      const ors: Array<Record<string, unknown>> = [{ board_id: boardParam }]
      const parsed = Number(boardParam)
      if (Number.isFinite(parsed)) {
        ors.push({ id: parsed })
      }
      const board = await prisma.board.findFirst({ where: { OR: ors } })
      if (!board) {
        return reply.send([])
      }
      const tags = (await prisma.tag.findMany({
        where: { board_id: board.id },
        orderBy: { name: 'asc' },
      })) as Array<{ id: number; name: string }>
      // Map to client-friendly shape
      const result = tags.map((t) => ({ id: String(t.id), title: t.name }))
      return reply.send(result)
    },
  )
}
