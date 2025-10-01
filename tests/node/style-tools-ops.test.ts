import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the board helpers to operate on a local array
const selection: Record<string, unknown>[] = []

vi.mock('../../src/board/board', () => ({
  forEachSelection: async (
    cb: (item: Record<string, unknown>) => Promise<void> | void,
  ): Promise<void> => {
    for (const item of selection) {
      // eslint-disable-next-line no-await-in-loop
      await cb(item)
    }
  },
  getFirstSelection: async () => selection[0],
  maybeSync: async () => {},
}))

import {
  tweakOpacity,
  tweakBorderWidth,
  tweakFillColor,
  copyFillFromSelection,
} from '../../src/board/style-tools'

describe('style-tools ops', () => {
  beforeEach(() => {
    selection.length = 0
  })

  it('tweakOpacity adjusts and clamps', async () => {
    selection.push({ style: { opacity: 0.5 } })
    await tweakOpacity(0.2)
    const first = selection[0]
    if (!first) {
      throw new Error('Expected selection to contain an item')
    }
    expect((first.style as any).opacity).toBe(0.7)
    await tweakOpacity(1)
    expect((first.style as any).opacity).toBe(1)
  })

  it('tweakOpacity supports fillOpacity and clamps to 0', async () => {
    selection.push({ style: { fillOpacity: 0.4 } })
    await tweakOpacity(-0.6)
    const first = selection[0]
    if (!first) {
      throw new Error('Expected selection to contain an item')
    }
    expect((first.style as any).fillOpacity).toBe(0)
  })

  it('tweakBorderWidth adjusts and clamps to >= 0', async () => {
    selection.push({ style: { strokeWidth: 2 } })
    await tweakBorderWidth(-5)
    const first = selection[0]
    if (!first) {
      throw new Error('Expected selection to contain an item')
    }
    expect((first.style as any).strokeWidth).toBe(0)
  })

  it('tweakFillColor adjusts fill and preserves contrast', async () => {
    selection.push({ style: { fillColor: '#000000', color: '#000000' } })
    await tweakFillColor(1)
    const first = selection[0]
    if (!first) {
      throw new Error('Expected selection to contain an item')
    }
    const style = first.style as any
    expect(style.fillColor).toBe('#ffffff')
    // font color remains readable (likely still black for white bg)
    expect(style.color).toBe('#000000')
  })

  it('copyFillFromSelection returns first selection fill color', async () => {
    selection.push({ style: { fillColor: '#123456' } })
    const hex = await copyFillFromSelection()
    expect(hex).toBe('#123456')
  })
})
