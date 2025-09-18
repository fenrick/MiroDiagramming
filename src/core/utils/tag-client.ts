export interface TagInfo {
  id: string
  title: string
  color?: string
}

/** Minimal client for board tag operations relying on the Web SDK. */
export class TagClient {
  public constructor() {}

  /** Retrieve all tags for the board. */
  public async getTags(): Promise<TagInfo[]> {
    const board = globalThis.miro?.board
    if (typeof board?.get !== 'function') {
      return []
    }
    const tags = await board.get({ type: 'tag' })
    const result: TagInfo[] = []
    for (const tag of tags) {
      // eslint-disable-next-line no-restricted-syntax
      const record = tag as unknown as { id?: unknown; title?: unknown; color?: unknown }
      const { id, title } = record
      if (typeof id === 'string' && typeof title === 'string') {
        result.push({
          id,
          title,
          color: typeof record.color === 'string' ? record.color : undefined,
        })
      }
    }
    return result
  }

  /** Create a tag on the current board. */
  public async createTag(title: string): Promise<TagInfo | undefined> {
    const board = globalThis.miro?.board
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
