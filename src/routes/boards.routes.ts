import type { FastifyPluginAsync } from 'fastify'

import { MiroService } from '../services/miroService.js'

/**
 * Routes dealing with board data lookups.
 */
export const registerBoardsRoutes: FastifyPluginAsync = async (app) => {
  const miro = new MiroService()
  app.get('/api/boards/:boardId/widgets', async (req) => {
    const { boardId } = req.params as { boardId: string }
    const typesParam = (req.query as { types?: string }).types
    const types = typesParam ? typesParam.split(',').filter(Boolean) : []
    return miro.getWidgets(req.userId, boardId, types)
  })
}
