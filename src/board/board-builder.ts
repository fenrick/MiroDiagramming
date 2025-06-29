import type { ConnectorTemplate, TemplateElement } from './templates';
import { templateManager } from './templates';
import type {
  BaseItem,
  Connector,
  ConnectorStyle,
  Frame,
  Group,
  GroupableItem,
  Shape,
  ShapeStyle,
  Text,
  TextAlignVertical,
  TextStyle,
} from '@mirohq/websdk-types';
import type {
  EdgeData,
  EdgeHint,
  NodeData,
  PositionedNode,
} from '../core/graph';
import { maybeSync } from './board';

const META_KEY = 'app.miro.structgraph';

/**
 * Helper responsible for finding, creating and updating widgets on the board.
 */
export class BoardBuilder {
  private frame: Frame | undefined;
  /** Cached lookup map for shapes by label content. */
  private shapeMap: Map<string, BaseItem> | undefined;

  /** Reset any builder state between runs. */
  public reset(): void {
    this.frame = undefined;
    this.shapeMap = undefined;
  }

  /** Assign a parent frame for subsequently created items. */
  public setFrame(frame: Frame | undefined): void {
    this.frame = frame;
  }

  /** Retrieve the current frame used for new items, if any. */
  public getFrame(): Frame | undefined {
    return this.frame;
  }

  /**
   * Find a free area on the board that can fit the given dimensions.
   * This uses the built-in `findEmptySpace` API starting from the
   * current viewport center.
   */
  public async findSpace(
    width: number,
    height: number,
  ): Promise<{ x: number; y: number }> {
    this.ensureBoard();
    const vp = await miro.board.viewport.get();
    const empty = await miro.board.findEmptySpace({
      width,
      height,
      x: vp.x + vp.width / 2,
      y: vp.y + vp.height / 2,
      offset: 40,
    });
    return { x: empty.x, y: empty.y };
  }

  /** Create a frame at the specified location. */
  public async createFrame(
    width: number,
    height: number,
    x: number,
    y: number,
    title?: string,
  ): Promise<Frame> {
    this.ensureBoard();
    const frame = (await miro.board.createFrame({
      title: title ?? '',
      x,
      y,
      width,
      height,
    })) as Frame;
    this.frame = frame;
    return frame;
  }

  /** Move the viewport to show the provided frame or widgets. */
  public async zoomTo(target: Frame | Array<BaseItem | Group>): Promise<void> {
    this.ensureBoard();
    const items = Array.isArray(target)
      ? (target as Array<BaseItem>)
      : (target as BaseItem);
    await miro.board.viewport.zoomTo(items);
  }

  /** Lookup an existing widget with matching metadata. */
  public async findNode(
    type: unknown,
    label: unknown,
  ): Promise<BaseItem | Group | undefined> {
    if (typeof type !== 'string' || typeof label !== 'string') {
      throw new Error('Invalid search parameters');
    }
    const fromShapes = await this.searchShapes(type, label);
    if (fromShapes) return fromShapes;
    return this.searchGroups(type, label);
  }

  /** Create or update a node widget from a template. */
  public async createNode(
    node: unknown,
    pos: PositionedNode,
  ): Promise<BaseItem | Group> {
    if (!pos || typeof pos.x !== 'number' || typeof pos.y !== 'number') {
      throw new Error('Invalid position');
    }
    if (!BoardBuilder.isNodeData(node)) {
      throw new Error('Invalid node');
    }
    const nodeData = node;
    const templateDef = templateManager.getTemplate(nodeData.type);
    if (!templateDef) {
      throw new Error(`Template '${nodeData.type}' not found`);
    }
    const widget = await this.createNewNode(nodeData, pos);
    await this.resizeItem(widget, pos.width, pos.height);
    return widget;
  }

  /**
   * Create new connectors between nodes.
   * Existing connectors are ignored; a fresh widget is created for each edge.
   */
  public async createEdges(
    edges: EdgeData[],
    nodeMap: Record<string, BaseItem | Group>,
    hints?: EdgeHint[],
  ): Promise<Connector[]> {
    if (!Array.isArray(edges)) {
      throw new Error('Invalid edges');
    }
    if (!nodeMap || typeof nodeMap !== 'object') {
      throw new Error('Invalid node map');
    }
    const created = await Promise.all(
      edges.map(async (edge, i) => {
        const from = nodeMap[edge.from];
        const to = nodeMap[edge.to];
        if (!from || !to) return undefined;
        const templateName =
          typeof edge.metadata?.template === 'string'
            ? edge.metadata.template
            : 'default';
        const template = templateManager.getConnectorTemplate(templateName);
        return this.createConnector(edge, from, to, hints?.[i], template);
      }),
    );
    return created.filter(Boolean) as Connector[];
  }

  /** Call `.sync()` on each widget if the method exists. */
  public async syncAll(
    items: Array<BaseItem | Group | Connector>,
  ): Promise<void> {
    await Promise.all(
      items.map((i) => maybeSync(i as { sync?: () => Promise<void> })),
    );
  }

  /** Remove the provided widgets from the board. */
  public async removeItems(
    items: Array<BaseItem | Group | Connector | Frame>,
  ): Promise<void> {
    this.ensureBoard();
    await Promise.all(
      items.map((item) => miro.board.remove(item as unknown as BaseItem)),
    );
  }

  /** Group multiple widgets together on the board. */
  public async groupItems(items: GroupableItem[]): Promise<Group> {
    this.ensureBoard();
    return (await miro.board.group({ items })) as Group;
  }

  private ensureBoard(): void {
    if (typeof miro === 'undefined' || !miro?.board) {
      throw new Error('Miro board not initialized');
    }
  }

  /**
   * Find an item whose metadata satisfies the provided predicate.
   * Metadata for all items is loaded concurrently for efficiency.
   */
  private async findByMetadata<
    T extends { getMetadata: (key: string) => Promise<unknown> },
  >(
    items: T[],
    predicate: (meta: unknown, item: T) => boolean,
  ): Promise<T | undefined> {
    const metas = await Promise.all(items.map((i) => i.getMetadata(META_KEY)));
    for (let i = 0; i < items.length; i++) {
      if (predicate(metas[i], items[i])) {
        return items[i];
      }
    }
    return undefined;
  }

  /** Populate the shape cache when not yet loaded. */
  private async loadShapeMap(): Promise<void> {
    if (!this.shapeMap) {
      this.ensureBoard();
      const shapes = (await miro.board.get({ type: 'shape' })) as Shape[];
      this.shapeMap = new Map();
      shapes
        .filter((s) => typeof s.content === 'string' && s.content.trim())
        .forEach((s) => this.shapeMap!.set(s.content, s as BaseItem));
    }
  }

  /**
   * Search board shapes for metadata that matches the given type and label.
   * Returns the corresponding item if found.
   */
  private async searchShapes(
    _type: string,
    label: string,
  ): Promise<BaseItem | Group | undefined> {
    await this.loadShapeMap();
    const item = this.shapeMap?.get(label);
    return item;
  }

  /**
   * Search all groups on the board for an item whose metadata matches
   * the provided type and label.
   */
  private async searchGroups(
    type: string,
    label: string,
  ): Promise<BaseItem | Group | undefined> {
    this.ensureBoard();
    const groups = (await miro.board.get({ type: 'group' })) as Group[];
    const matches = await Promise.all(
      groups.map(async (group) => {
        const items = await group.getItems();
        if (!Array.isArray(items)) return undefined;
        const found = await this.findByMetadata(items as BaseItem[], (meta) => {
          const data = meta as NodeMetadata | undefined;
          return data?.type === type && data.label === label;
        });
        return found ? group : undefined;
      }),
    );
    return matches.find(Boolean);
  }

  /**
   * Apply template values for a shape element to an existing item.
   * This updates geometry, text content and style attributes in place.
   */
  public applyShapeElement(
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
      style.fillColor = templateManager.resolveStyle({
        fillColor: element.fill,
      }).fillColor as string;
    }
    shape.style = style as ShapeStyle;
  }

  /**
   * Apply text element properties such as content and style to a widget.
   */
  public applyTextElement(
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
   * Shapes and text widgets share most properties but are handled separately.
   */
  public applyElementToItem(
    item: BaseItem,
    element: TemplateElement,
    label: string,
  ): void {
    if (item.type === 'shape') {
      this.applyShapeElement(item, element, label);
    } else if (item.type === 'text') {
      this.applyTextElement(item, element, label);
    }
  }

  /**
   * Create a new widget (or group) for the node using template defaults.
   */
  private async createNewNode(
    node: NodeData,
    pos: PositionedNode,
  ): Promise<BaseItem | Group> {
    const widget = await templateManager.createFromTemplate(
      node.type,
      node.label,
      pos.x,
      pos.y,
      this.frame,
    );
    if ((widget as Group).type === 'group') {
      const items = await (widget as Group).getItems();
      await Promise.all(
        items.map((item) =>
          item.setMetadata(META_KEY, { type: node.type, label: node.label }),
        ),
      );
      return widget as Group;
    }
    await (widget as BaseItem).setMetadata(META_KEY, {
      type: node.type,
      label: node.label,
    });
    return widget as BaseItem;
  }

  /**
   * Resize an item if width and height properties are available.
   * The widget is synchronised when a sync method exists.
   */
  public async resizeItem(
    item: BaseItem | Group,
    width: number,
    height: number,
  ): Promise<void> {
    const target = item as {
      width?: number;
      height?: number;
      sync?: () => Promise<void>;
    };
    if (typeof target.width === 'number') target.width = width;
    if (typeof target.height === 'number') target.height = height;
    await maybeSync(target);
  }

  /**
   * Apply metadata and styling updates to an existing connector widget.
   */
  /**
   * Update an existing connector with style, label and hint data.
   */
  public updateConnector(
    connector: Connector,
    edge: EdgeData,
    template?: ConnectorTemplate,
    hint?: EdgeHint,
  ): void {
    if (edge.label) {
      connector.captions = [
        {
          content: edge.label,
          position: template?.caption?.position,
          textAlignVertical: template?.caption
            ?.textAlignVertical as TextAlignVertical,
        },
      ];
    }
    if (template?.style) {
      connector.style = {
        ...connector.style,
        ...template.style,
      } as ConnectorStyle;
    }
    connector.shape = template?.shape ?? connector.shape;
    if (hint?.startPosition) {
      connector.start = {
        ...(connector.start ?? {}),
        position: hint.startPosition,
      } as Connector['start'];
    }
    if (hint?.endPosition) {
      connector.end = {
        ...(connector.end ?? {}),
        position: hint.endPosition,
      } as Connector['end'];
    }
  }

  /**
   * Create a new connector between the given widgets using template defaults.
   */
  private async createConnector(
    edge: EdgeData,
    from: BaseItem | Group,
    to: BaseItem | Group,
    hint: EdgeHint | undefined,
    template?: ConnectorTemplate,
  ): Promise<Connector> {
    const connector = await miro.board.createConnector({
      start: { item: from.id, position: hint?.startPosition },
      end: { item: to.id, position: hint?.endPosition },
      shape: template?.shape ?? 'curved',
      captions: edge.label
        ? [
            {
              content: edge.label,
              position: template?.caption?.position,
              textAlignVertical: template?.caption
                ?.textAlignVertical as TextAlignVertical,
            },
          ]
        : undefined,
      style: template?.style as ConnectorStyle | undefined,
    });
    await connector.setMetadata(META_KEY, { from: edge.from, to: edge.to });
    return connector;
  }

  /**
   * Type guard ensuring the provided value conforms to {@link NodeData}.
   */
  private static isNodeData(node: unknown): node is NodeData {
    return (
      !!node &&
      typeof node === 'object' &&
      typeof (node as Record<string, unknown>).type === 'string' &&
      typeof (node as Record<string, unknown>).label === 'string'
    );
  }
}

interface NodeMetadata {
  type: string;
  label: string;
}
