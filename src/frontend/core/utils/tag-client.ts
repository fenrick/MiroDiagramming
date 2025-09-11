import { apiFetch } from './api-fetch'

export interface TagInfo {
  id: string
  title: string
  color?: string
}

/** Minimal client for board tag operations. */
export class TagClient {
  public constructor(
    private readonly boardId: string,
    private readonly baseUrl = '/api/boards',
  ) {}

  private get url(): string {
    return `${this.baseUrl}/${this.boardId}/tags`
  }

  /** Retrieve all tags for the board. */
  public async getTags(): Promise<TagInfo[]> {
    if (typeof fetch !== 'function') {
      return []
    }
    const res = await apiFetch(this.url)
    if (!res.ok) {
      return []
    }
    return (await res.json()) as TagInfo[]
  }

  /** Create a tag on the current board. */
  public async createTag(title: string): Promise<TagInfo | undefined> {
    const board = (
      globalThis as {
        miro?: { board?: { createTag?: (t: { title: string }) => Promise<TagInfo> } }
      }
    ).miro?.board
    if (typeof board?.createTag !== 'function') {
      return undefined
    }
    try {
      const tag = (await board.createTag({ title })) as TagInfo
      return tag
    } catch {
      return undefined
    }
  }
}
