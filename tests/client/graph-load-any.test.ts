import { defaultBuilder, graphService } from '../src/core/graph'

interface ReaderEvent {
  target: { result?: string | null } | null
}

describe('loadAnyGraph', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    delete (global as { FileReader?: unknown }).FileReader
  })

  test('parses graph data and resets cache', async () => {
    const resetSpy = vi.spyOn(defaultBuilder, 'reset')

    class FR {
      onload: ((e: ReaderEvent) => void) | null = null
      onerror: (() => void) | null = null

      readAsText() {
        this.onload?.({
          target: { result: '{"nodes":[],"edges":[]}' },
        } as ReaderEvent)
      }
    }

    ;(global as { FileReader?: unknown }).FileReader = FR
    const file = { name: 'g.json' } as unknown as File
    const data = await graphService.loadAnyGraph(file)
    expect(data).toEqual({ nodes: [], edges: [] })
    expect(resetSpy).toHaveBeenCalled()
  })

  test('parses hierarchy data', async () => {
    class FR {
      onload: ((e: ReaderEvent) => void) | null = null
      onerror: (() => void) | null = null

      readAsText() {
        this.onload?.({
          target: { result: '[{"id":"n","label":"L","type":"Motivation"}]' },
        } as ReaderEvent)
      }
    }

    ;(global as { FileReader?: unknown }).FileReader = FR
    const file = { name: 'h.json' } as unknown as File
    const data = await graphService.loadAnyGraph(file)
    expect(Array.isArray(data)).toBe(true)
    if (Array.isArray(data)) {
      expect(data[0]).toMatchObject({
        id: 'n',
        label: 'L',
        type: 'Motivation',
      })
    }
  })

  test('throws on malformed JSON', async () => {
    class FR {
      onload: ((e: ReaderEvent) => void) | null = null

      readAsText() {
        this.onload?.({ target: { result: 'null' } } as ReaderEvent)
      }
    }

    ;(global as { FileReader?: unknown }).FileReader = FR
    await expect(
      graphService.loadAnyGraph({ name: 'bad.json' } as unknown as File),
    ).rejects.toThrow('Invalid graph data')
  })
})
