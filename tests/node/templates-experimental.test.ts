import { describe, it, expect, vi } from 'vitest'

describe('TemplateManager experimental shape overrides', () => {
  it('applies experimentalShapeMap.json overrides to primary element shape', async () => {
    vi.resetModules()
    vi.mock('../../templates/experimentalShapeMap.json', () => ({
      default: { MermaidClass: 'diamond' },
    }))
    const { TemplateManager } = await import('../../src/board/templates')
    const mgr = TemplateManager.getInstance()
    const tpl = mgr.getTemplate('MermaidClass')
    expect(tpl?.elements?.[0]?.shape).toBe('diamond')
  })
})
