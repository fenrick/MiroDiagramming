import type { BaseItem, Shape, ShapeStyle, Text, TextStyle } from '@mirohq/websdk-types'

import type { TemplateElement } from './templates'
import { normalizeTemplateShape, templateManager } from './templates'

/**
 * Combine an item's current style with values from a template element.
 *
 * Design tokens contained in the template are resolved and the legacy
 * {@link TemplateElement.fill} property is used when no `fillColor` is present
 * in the resulting style object. The function is purely functional and returns
 * a new style object without mutating the original.
 *
 * @param existing - Current widget style object which may be `undefined`.
 * @param element - Template element providing default style values.
 * @returns Final style ready for assignment to a widget.
 *
 * @example
 * ```ts
 * const style = buildShapeStyle({ borderWidth: 1 }, { fill: '#fff' });
 * widget.style = style;
 * ```
 */
export function buildShapeStyle(
  existing: Partial<ShapeStyle> | undefined,
  element: TemplateElement,
): ShapeStyle {
  const style: Record<string, unknown> = {}
  if (existing) {
    Object.assign(style, existing)
  }
  Object.assign(style, templateManager.resolveStyle(element.style ?? {}))
  if (element.fill && style.fillColor === undefined) {
    style.fillColor = templateManager.resolveStyle({ fillColor: element.fill }).fillColor as string
  }
  return style as ShapeStyle
}

/**
 * Apply template values for a shape element to an existing widget.
 *
 * Geometry, text content and style attributes are updated in place. The
 * function does nothing when the provided item is not a shape widget.
 *
 * @param item - Board item expected to be of type `shape`.
 * @param element - Template description containing default values.
 * @param label - Label text substituted into the template.
 *
 * @example
 * ```ts
 * applyShapeElement(widget, { text: 'Name: {{label}}' }, 'Node');
 * ```
 */
export function applyShapeElement(item: BaseItem, element: TemplateElement, label: string): void {
  if (item.type !== 'shape') {
    return
  }
  const shape = item as Shape
  type MutableShape = Shape & { shape: Shape['shape']; width: number; height: number }
  const mutable = shape as MutableShape
  if (typeof element.shape === 'string') {
    mutable.shape = normalizeTemplateShape(element.shape)
  }
  if (typeof element.rotation === 'number') {
    mutable.rotation = element.rotation
  }
  if (typeof element.width === 'number') {
    mutable.width = element.width
  }
  if (typeof element.height === 'number') {
    mutable.height = element.height
  }
  shape.content = (element.text ?? '{{label}}').replace('{{label}}', label)
  shape.style = buildShapeStyle(shape.style as Partial<ShapeStyle>, element)
}

/**
 * Apply text element properties such as content and style to a widget.
 *
 * @param item - Board item of type `text`.
 * @param element - Template description for the text element.
 * @param label - Label text substituted into the template.
 *
 * @example
 * ```ts
 * applyTextElement(widget, { text: 'Hello {{label}}' }, 'World');
 * ```
 */
export function applyTextElement(item: BaseItem, element: TemplateElement, label: string): void {
  if (item.type !== 'text') {
    return
  }
  const text = item as Text
  text.content = (element.text ?? '{{label}}').replace('{{label}}', label)
  if (element.style) {
    const currentStyle = text.style as Partial<TextStyle>
    const resolved = templateManager.resolveStyle(element.style) as Partial<TextStyle>
    text.style = { ...currentStyle, ...resolved } as TextStyle
  }
}

/**
 * Route element application based on widget type.
 *
 * @param item - Target widget which must be a shape or text.
 * @param element - Element description from a template.
 * @param label - Label text substituted into the template.
 *
 * @example
 * ```ts
 * applyElementToItem(widget, { text: '{{label}}' }, 'Example');
 * ```
 */
export function applyElementToItem(item: BaseItem, element: TemplateElement, label: string): void {
  if (item.type === 'shape') {
    applyShapeElement(item, element, label)
  } else if (item.type === 'text') {
    applyTextElement(item, element, label)
  }
}
