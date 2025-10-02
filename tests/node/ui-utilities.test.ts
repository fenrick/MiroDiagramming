import { describe, it, expect, vi } from 'vitest'
import { colors } from '@mirohq/design-tokens'

import { getDropzoneStyle, undoLastImport } from '../../src/ui/hooks/ui-utilities'
import type { GraphProcessor } from '../../src/core/graph/graph-processor'

describe('ui utilities', () => {
  it('computes dropzone border color by state', () => {
    expect(getDropzoneStyle('base').borderColor).toBe(colors['alpha-black-400'])
    expect(getDropzoneStyle('accept').borderColor).toBe(colors['green-700'])
    expect(getDropzoneStyle('reject').borderColor).toBe(colors['red-700'])
  })

  it('undoLastImport calls processor and clear when present', async () => {
    const undo = vi.fn<() => Promise<void>>(() => Promise.resolve())
    const clear = vi.fn()
    const processor = { undoLast: undo } satisfies Pick<GraphProcessor, 'undoLast'>
    await undoLastImport(processor as unknown as GraphProcessor, clear)
    expect(undo).toHaveBeenCalled()
    expect(clear).toHaveBeenCalled()
  })

  it('undoLastImport is a no-op when processor is missing', async () => {
    const clear = vi.fn()
    await undoLastImport(undefined, clear)
    expect(clear).not.toHaveBeenCalled()
  })
})
