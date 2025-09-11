import { getMiro } from '../miro/miroClient.js'
import { withMiroRetry } from '../miro/retry.js'

export class MiroService {
  /**
   * Create a card-like node on a given board for a user.
   *
   * - Requires `boardId` in the payload; otherwise this is a no-op.
   * - Title/description are mapped to the card item; other fields are ignored here.
   */
  async createNode(userId: string, nodeId: string, data: Record<string, unknown>): Promise<void> {
    // For cards, expect a boardId in data to route creation; otherwise skip
    const boardId = (data as { boardId?: string }).boardId
    if (!boardId) {
      return // no-op without board id
    }
    const title = (data as { title?: string }).title ?? nodeId
    const description = (data as { description?: string }).description
    const api = getMiro().as(userId)
    const board = await withMiroRetry(() => api.getBoard(boardId))
    await withMiroRetry(() => board.createCardItem({ data: { title, description } }))
  }
}
