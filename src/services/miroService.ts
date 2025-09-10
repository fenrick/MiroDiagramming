import { getMiro } from '../miro/miroClient.js'

export class MiroService {
  async createNode(userId: string, nodeId: string, data: Record<string, unknown>): Promise<void> {
    // For cards, expect a boardId in data to route creation; otherwise skip
    const boardId = (data as { boardId?: string }).boardId
    if (!boardId) {
      return // no-op without board id
    }
    const title = (data as { title?: string }).title ?? nodeId
    const description = (data as { description?: string }).description
    const api = getMiro().as(userId)
    const board = await api.getBoard(boardId)
    await board.createCardItem({ data: { title, description } })
  }
}
