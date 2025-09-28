import { describe, it, expect, vi } from 'vitest'

import { registerFrame, clearActiveFrame } from '../../src/board/frame-utilities'

class BuilderStub {
  frame: any
  async createFrame(w: number, h: number, x: number, y: number, title?: string) {
    this.frame = { id: 'frame', w, h, x, y, title }
    return this.frame
  }
  setFrame(v: any) {
    this.frame = v
  }
}

describe('frame-utils', () => {
  it('registerFrame creates and registers frame', async () => {
    const builder = new BuilderStub() as unknown as any
    const registry: any[] = []
    const frame = await registerFrame(builder, registry, 100, 50, { x: 10, y: 20 }, 'T')
    expect(frame.id).toBe('frame')
    expect(registry[0]).toBe(frame)
  })

  it('clearActiveFrame clears builder frame', () => {
    const builder = new BuilderStub() as unknown as any
    builder.setFrame({ id: 'f' })
    clearActiveFrame(builder)
    expect(builder.frame).toBeUndefined()
  })
})
