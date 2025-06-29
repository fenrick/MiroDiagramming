import { templateManager } from './templates';
import type {
  BaseItem,
  Shape,
  ShapeStyle,
  Text,
  TextStyle,
} from '@mirohq/websdk-types';
import type { TemplateElement } from './templates';

/**
 * Apply template values for a shape element to an existing widget.
 *
 * This updates geometry, text content and style attributes in place.
 *
 * @param item - Board item expected to be of type `shape`.
 * @param element - Template description containing default values.
 * @param label - Label text substituted into the template.
 */
export function applyShapeElement(
  item: BaseItem,
  element: TemplateElement,
  label: string,
): void {
  const shape = item as Shape;
  if (element.shape) shape.shape = element.shape as Shape['shape'];
  if (element.rotation !== undefined) shape.rotation = element.rotation;
  if (element.width)
    (shape as unknown as { width: number }).width = element.width;
  if (element.height)
    (shape as unknown as { height: number }).height = element.height;
  shape.content = (element.text ?? '{{label}}').replace('{{label}}', label);
  const existing = (shape.style ?? {}) as Partial<ShapeStyle>;
  const style: Partial<ShapeStyle> & Record<string, unknown> = {
    ...existing,
    ...templateManager.resolveStyle(element.style ?? {}),
  };
  if (element.fill && !('fillColor' in style)) {
    style.fillColor = templateManager.resolveStyle({ fillColor: element.fill })
      .fillColor as string;
  }
  shape.style = style as ShapeStyle;
}

/**
 * Apply text element properties such as content and style to a widget.
 *
 * @param item - Board item of type `text`.
 * @param element - Template description for the text element.
 * @param label - Label text substituted into the template.
 */
export function applyTextElement(
  item: BaseItem,
  element: TemplateElement,
  label: string,
): void {
  const text = item as Text;
  text.content = (element.text ?? '{{label}}').replace('{{label}}', label);
  if (element.style) {
    text.style = {
      ...(text.style ?? ({} as Partial<TextStyle>)),
      ...(templateManager.resolveStyle(element.style) as Partial<TextStyle>),
    } as TextStyle;
  }
}

/**
 * Route element application based on widget type.
 *
 * @param item - Target widget which must be a shape or text.
 * @param element - Element description from a template.
 * @param label - Label text substituted into the template.
 */
export function applyElementToItem(
  item: BaseItem,
  element: TemplateElement,
  label: string,
): void {
  if (item.type === 'shape') {
    applyShapeElement(item, element, label);
  } else if (item.type === 'text') {
    applyTextElement(item, element, label);
  }
}
