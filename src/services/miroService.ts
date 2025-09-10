import fetch from 'node-fetch'

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
    const accessToken = await getMiro().getAccessToken(userId)
    const res = await fetch(`https://api.miro.com/v2/boards/${boardId}/cards`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, description }),
    })
    if (!res.ok) {
      const body = await res.text()
      throw new Error(`Miro create card failed: ${res.status} ${body}`)
    }
  }
}
