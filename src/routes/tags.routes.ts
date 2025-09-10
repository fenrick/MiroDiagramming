import type { FastifyPluginAsync } from 'fastify'

import { getPrisma } from '../config/db.js'

export const registerTagsRoutes: FastifyPluginAsync = async (app) => {
  app.get('/api/boards/:boardId/tags', async (req, reply) => {
    const prisma = getPrisma()
    const boardParam = (req.params as { boardId: string }).boardId
    // Try to resolve either by external board_id (string) or internal id (number)
    let board = await prisma.board.findFirst({ where: { board_id: boardParam } })
    if (!board) {
      const parsed = Number(boardParam)
      if (Number.isFinite(parsed)) {
        board = await prisma.board.findUnique({ where: { id: parsed } })
      }
    }
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
  })
}
