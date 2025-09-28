import type { BaseItem, Shape } from '@mirohq/websdk-types'

import type { TemplateElement } from './templates'
import { applyShapeElement } from './element-utilities'
import type { Syncable } from './board'

export interface ShapeUpdateOptions {
  position?: { x: number; y: number }
  size?: { width?: number; height?: number }
  rotation?: number
  template?: TemplateElement
  label?: string
}

/**
 * Encapsulates imperative widget manipulation for shapes so behaviour can be
 * exercised and tested in isolation.
 */
export class ShapeInteraction {
  constructor(private readonly shape: Shape) {}

  /** Move the shape to the provided coordinates. */
  public move(position: { x: number; y: number }): this {
    Reflect.set(this.shape, 'x', position.x)
    Reflect.set(this.shape, 'y', position.y)
    return this
  }

  /** Resize the shape, preserving existing dimensions when omitted. */
  public resize(size: { width?: number; height?: number }): this {
    if (typeof size.width === 'number') {
      Reflect.set(this.shape, 'width', size.width)
    }
    if (typeof size.height === 'number') {
      Reflect.set(this.shape, 'height', size.height)
    }
    return this
  }

  /** Apply a template element update including optional label substitution. */
  public applyTemplate(element: TemplateElement, label: string): this {
    applyShapeElement(this.shape, element, label)
    return this
  }

  /** Rotate the shape to the specified angle in degrees. */
  public rotate(angle: number): this {
    Reflect.set(this.shape, 'rotation', angle)
    return this
  }

  /** Persist accumulated updates to the board. */
  public async commit(): Promise<void> {
    const candidate = this.shape as Syncable
    if (typeof candidate.sync === 'function') {
      await candidate.sync()
    }
  }
}

/**
 * Factory for shape interactions that is agnostic of the widget source.
 */
export class ShapeInteractionManager {
  /** Begin an interaction for the given board item. */
  public begin(item: BaseItem): ShapeInteraction {
    if (item.type !== 'shape') {
      throw new TypeError('Shape interaction requires a shape widget')
    }
    return new ShapeInteraction(item as Shape)
  }

  /**
   * Apply a declarative update to a shape widget in a single transaction.
   */
  public async update(item: BaseItem, update: ShapeUpdateOptions): Promise<void> {
    const interaction = this.begin(item)
    if (update.position) {
      interaction.move(update.position)
    }
    if (
      update.size &&
      (typeof update.size.width === 'number' || typeof update.size.height === 'number')
    ) {
      interaction.resize(update.size)
    }
    if (typeof update.rotation === 'number') {
      interaction.rotate(update.rotation)
    }
    if (update.template) {
      interaction.applyTemplate(update.template, update.label ?? '')
    }
    await interaction.commit()
  }
}
