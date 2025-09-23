import { describe, it, expect, vi } from 'vitest'

import type { StylePreset } from '../../src/ui/style-presets'
import { presetStyle as presetStyleDirect } from '../../src/board/format-tools'

describe('format-tools', () => {
  it('converts a StylePreset into resolved widget style', async () => {
    const preset: StylePreset = {
      label: 'Test',
      fontColor: 'var(--colors-gray-900)',
      borderColor: 'var(--colors-gray-200)',
      borderWidth: 3,
      fillColor: 'var(--colors-white)',
    }
    const resolved = presetStyleDirect(preset)
    expect(resolved.borderWidth).toBe(3)
    // CSS variables are not defined in tests so fallbacks are used
    expect(resolved.color).toBe('#000000')
    expect(resolved.borderColor).toBe('#000000')
    expect(resolved.fillColor).toBe('#ffffff')
  })

  it('applies a preset to selected items using board helpers', async () => {
    const selection: Record<string, unknown>[] = [{ style: { color: '#111111' } }]
    const preset: StylePreset = {
      label: 'Test',
      fontColor: '#000000',
      borderColor: '#222222',
      borderWidth: 2,
      fillColor: '#ffffff',
    }
    vi.resetModules()
    vi.doMock('../../src/board/board', () => ({
      forEachSelection: async (cb: (item: Record<string, unknown>) => Promise<void> | void) => {
        for (const item of selection) {
          // simulate the board applying callback to each selected item
          // eslint-disable-next-line no-await-in-loop
          await cb(item)
        }
      },
      maybeSync: async () => {},
    }))
    const { applyStylePreset } = await import('../../src/board/format-tools')
    await applyStylePreset(preset, {} as any)
    expect(selection[0].style).toMatchObject({
      color: '#000000',
      borderColor: '#222222',
      borderWidth: 2,
      fillColor: '#ffffff',
    })
  })
})
