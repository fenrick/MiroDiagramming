import {
  buildShapeStyle,
  applyShapeElement,
  applyTextElement,
  applyElementToItem,
} from '../src/board/element-utils'
import { templateManager } from '../src/board/templates'
import type { TemplateElement } from '../src/board/templates'
import { vi } from 'vitest'
import type { Shape, Text, BaseItem } from '@mirohq/websdk-types'

describe('buildShapeStyle', () => {
  afterEach(() => vi.restoreAllMocks())

  test('merges existing style with template style', () => {
    vi.spyOn(templateManager, 'resolveStyle').mockImplementation((style) => style)
    const result = buildShapeStyle({ borderWidth: 1 }, { style: { fillColor: '#fff' } })
    expect(result.borderWidth).toBe(1)
    expect(result.fillColor).toBe('#fff')
  })

  test('applies fill when fillColor missing', () => {
    vi.spyOn(templateManager, 'resolveStyle').mockImplementation((style) => style)
    const result = buildShapeStyle(undefined, { fill: '#abc', style: {} })
    expect(result.fillColor).toBe('#abc')
  })
})

describe('applyShapeElement and applyTextElement', () => {
  afterEach(() => vi.restoreAllMocks())

  test('updates shape geometry and content', () => {
    vi.spyOn(templateManager, 'resolveStyle').mockReturnValue({ color: 'red' })
    const item = { type: 'shape', style: {} } as unknown as Shape
    const element: TemplateElement = {
      shape: 'rhombus',
      width: 10,
      text: 'Hi {{label}}',
    }
    applyShapeElement(item as BaseItem, element, 'Bob')
    expect(item.shape).toBe('rhombus')
    expect(item.width).toBe(10)
    expect(item.content).toBe('Hi Bob')
    expect(item.style).toEqual({ color: 'red' })
  })

  test('ignores non shape item', () => {
    const item = { type: 'text' } as BaseItem
    applyShapeElement(item, { shape: 'rect' } as TemplateElement, '')
    expect(item.shape).toBeUndefined()
  })

  test('updates text content and style', () => {
    vi.spyOn(templateManager, 'resolveStyle').mockReturnValue({ size: 2 })
    const item = { type: 'text', style: {} } as unknown as Text
    const element: TemplateElement = {
      text: '{{label}}!',
      style: { color: 'blue' },
    }
    applyTextElement(item as BaseItem, element, 'Go')
    expect(item.content).toBe('Go!')
    expect(item.style).toEqual({ size: 2 })
  })

  test('applyElementToItem routes by type', () => {
    const shape = { type: 'shape', style: {} } as unknown as Shape
    const text = { type: 'text', style: {} } as unknown as Text
    vi.spyOn(templateManager, 'resolveStyle').mockReturnValue({})
    applyElementToItem(shape as BaseItem, { text: 'A' } as TemplateElement, 'x')
    applyElementToItem(text as BaseItem, { text: 'B' } as TemplateElement, 'y')
    expect(shape.content).toBe('A')
    expect(text.content).toBe('B')
  })
})
