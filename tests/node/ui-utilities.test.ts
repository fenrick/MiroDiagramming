import { describe, it, expect, vi } from 'vitest'

import { getDropzoneStyle, undoLastImport } from '../../src/ui/hooks/ui-utilities'
import type { GraphProcessor } from '../../src/core/graph/graph-processor'

describe('ui utilities', () => {
  it('computes dropzone border color by state', () => {
    expect(getDropzoneStyle('base').borderColor).toBe('rgba(0, 0, 0, 0.4)')
    expect(getDropzoneStyle('accept').borderColor).toBe('#154b08')
    expect(getDropzoneStyle('reject').borderColor).toBe('#6b1720')
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
