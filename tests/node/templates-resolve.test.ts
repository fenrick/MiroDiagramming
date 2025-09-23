import { describe, it, expect } from 'vitest'
import { colors } from '@mirohq/design-tokens'

import { TemplateManager } from '../../src/board/templates'

describe('TemplateManager resolution', () => {
  it('resolves tokens and numeric strings in style', () => {
    const mgr = TemplateManager.getInstance()
    const style = mgr.resolveStyle({
      borderWidth: '2',
      padding: '12px',
      fillColor: 'tokens.color.black',
    })
    expect(style.borderWidth).toBe(2)
    expect(style.padding).toBe(12)
    expect(style.fillColor).toBe(colors.black)
  })

  it('maps template aliases to their canonical name', () => {
    const mgr = TemplateManager.getInstance()
    const tpl = mgr.getTemplate('Driver') // alias of Motivation in fixtures
    expect(tpl?.elements?.[0]).toBeTruthy()
  })
})
