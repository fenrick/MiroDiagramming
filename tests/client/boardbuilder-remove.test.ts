import { BoardBuilder } from '../src/board/board-builder'

interface GlobalWithMiro {
  miro?: { board?: Record<string, unknown> }
}

declare const global: GlobalWithMiro

describe('BoardBuilder.removeItems', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    delete global.miro
  })

  test('removes provided items from board', async () => {
    const remove = vi.fn()
    global.miro = { board: { remove } }
    const builder = new BoardBuilder()
    const items = [{}, {}]
    await builder.removeItems(items as unknown as Array<Record<string, unknown>>)
    expect(remove).toHaveBeenCalledTimes(items.length)
    expect(remove).toHaveBeenCalledWith(items[0])
    expect(remove).toHaveBeenCalledWith(items[1])
  })

  test('throws when board not initialized', async () => {
    const builder = new BoardBuilder()
    await expect(builder.removeItems([{} as Record<string, unknown>])).rejects.toThrow(
      'Miro board not initialized',
    )
  })
})
