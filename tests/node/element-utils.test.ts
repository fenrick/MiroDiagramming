import { describe, it, expect } from 'vitest'
import type { BaseItem } from '@mirohq/websdk-types'

import {
  applyElementToItem,
  applyShapeElement,
  applyTextElement,
  buildShapeStyle,
} from '../../src/board/element-utils'

describe('element-utils', () => {
  it('builds shape style with template defaults', () => {
    const style = buildShapeStyle(
      { borderWidth: 1 },
      { fill: '#ffffff', style: { borderColor: '#000000' } },
    )
    expect(style.borderWidth).toBe(1)
    expect(style.borderColor).toBe('#000000')
    expect(style.fillColor).toBe('#ffffff')
  })

  it('applies shape element properties', () => {
    const shape = {
      type: 'shape',
      shape: 'rectangle',
      width: 10,
      height: 10,
      rotation: 0,
      content: '',
      style: {},
    } as unknown as BaseItem
    applyShapeElement(shape, { width: 20, height: 15, text: 'Hello {{label}}' }, 'World')
    // @ts-expect-error runtime checks
    expect(shape.width).toBe(20)
    // @ts-expect-error runtime checks
    expect(shape.height).toBe(15)
    // @ts-expect-error runtime checks
    expect(shape.content).toContain('Hello World')
  })

  it('applies text element properties', () => {
    const text = { type: 'text', content: '', style: {} } as unknown as BaseItem
    applyTextElement(text, { text: 'Hi {{label}}', style: { textAlign: 'center' } }, 'Bob')
    // @ts-expect-error runtime checks
    expect(text.content).toBe('Hi Bob')
    // @ts-expect-error runtime checks
    expect(text.style.textAlign).toBe('center')
  })

  it('routes apply by type', () => {
    const shape = {
      type: 'shape',
      shape: 'rectangle',
      width: 10,
      height: 10,
      content: '',
      style: {},
    } as unknown as BaseItem
    const text = { type: 'text', content: '', style: {} } as unknown as BaseItem
    applyElementToItem(shape, { text: 'S {{label}}' }, 'A')
    applyElementToItem(text, { text: 'T {{label}}' }, 'B')
    // @ts-expect-error runtime checks
    expect(shape.content).toBe('S A')
    // @ts-expect-error runtime checks
    expect(text.content).toBe('T B')
  })
})
