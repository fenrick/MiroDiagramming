import { templateManager } from './templates';
import type {
  BaseItem,
  Group,
  Connector,
  ConnectorStyle,
  Frame,
} from '@mirohq/websdk-types';
import type {
  TemplateElement,
  ConnectorTemplate,
  TemplateDefinition,
} from './templates';
import type { NodeData, EdgeData, PositionedNode, EdgeHint } from './graph';

const META_KEY = 'app.miro.structgraph';

/**
 * Helper responsible for finding, creating and updating widgets on the board.
 * A small cache avoids repeated board lookups while processing a graph.
 */
export class BoardBuilder {
  private shapeCache: BaseItem[] | undefined;
  private connectorCache: Connector[] | undefined;
  private frame: Frame | undefined;

  /** Clear cached board lookups. Useful between runs or during tests. */
  public reset(): void {
    this.shapeCache = undefined;
    this.connectorCache = undefined;
    this.frame = undefined;
  }

  private ensureBoard(): void {
    if (typeof miro === 'undefined' || !miro?.board) {
      throw new Error('Miro board not initialized');
    }
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
    await miro.board.viewport.zoomTo(target as any);
  }

  private async loadShapeCache(): Promise<void> {
    this.ensureBoard();
    if (!this.shapeCache) {
      this.shapeCache = (await miro.board.get({ type: 'shape' })) as BaseItem[];
    }
  }

  private async loadConnectorCache(): Promise<void> {
    this.ensureBoard();
    if (!this.connectorCache) {
      this.connectorCache = (await miro.board.get({
        type: 'connector',
      })) as Connector[];
    }
  }

  /**
   * Find an item whose metadata satisfies the provided predicate.
   * Metadata for all items is loaded concurrently for efficiency.
   */
  private async findByMetadata<T extends BaseItem | Group | Connector>(
    items: T[],
    predicate: (meta: any, item: T) => boolean,
  ): Promise<T | undefined> {
    const metas = await Promise.all(
      items.map(i => (i as any).getMetadata(META_KEY)),
    );
    for (let i = 0; i < items.length; i++) {
      if (predicate(metas[i], items[i])) {
        return items[i];
      }
    }
    return undefined;
  }

  /**
   * Search cached shapes for metadata that matches the given type and label.
   * Returns the corresponding item if found.
   */
  private async searchShapes(
    type: string,
    label: string,
  ): Promise<BaseItem | Group | undefined> {
    await this.loadShapeCache();
    const shapes = this.shapeCache ?? [];
    return this.findByMetadata(shapes, meta => {
      const data = meta as NodeMetadata | undefined;
      return data?.type === type && data.label === label;
    });
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
      groups.map(async group => {
        const items = await group.getItems();
        if (!Array.isArray(items)) return undefined;
        const found = await this.findByMetadata(items as BaseItem[], meta => {
          const data = meta as NodeMetadata | undefined;
          return data?.type === type && data.label === label;
        });
        return found ? group : undefined;
      }),
    );
    return matches.find(Boolean);
  }

  /** Lookup an existing widget with matching metadata. */
  public async findNode(
    type: string,
    label: string,
  ): Promise<BaseItem | Group | undefined> {
    if (typeof type !== 'string' || typeof label !== 'string') {
      throw new Error('Invalid search parameters');
    }
    const fromShapes = await this.searchShapes(type, label);
    if (fromShapes) return fromShapes;
    return this.searchGroups(type, label);
  }

  /** Find a connector with matching metadata if it exists on the board. */
  public async findConnector(
    from: string,
    to: string,
  ): Promise<Connector | undefined> {
    if (typeof from !== 'string' || typeof to !== 'string') {
      throw new Error('Invalid search parameters');
    }
    await this.loadConnectorCache();
    const connectors = this.connectorCache ?? [];
    return this.findByMetadata(connectors, meta => {
      const data = meta as EdgeMetadata | undefined;
      return data?.from === from && data.to === to;
    });
  }

  /**
   * Apply template values for a shape element to an existing item.
   * This updates geometry, text content and style attributes in place.
   */
  private applyShapeElement(
    item: BaseItem,
    element: TemplateElement,
    label: string,
  ): void {
    if (element.shape) (item as any).shape = element.shape;
    if (element.rotation !== undefined)
      (item as any).rotation = element.rotation;
    if (element.width) (item as any).width = element.width;
    if (element.height) (item as any).height = element.height;
    (item as any).content = (element.text ?? '{{label}}').replace(
      '{{label}}',
      label,
    );
    const existing = (item as any).style ?? {};
    const style: Record<string, unknown> = {
      ...existing,
      ...(element.style ?? {}),
    };
    if (element.fill && !('fillColor' in style)) {
      (style as any).fillColor = element.fill;
    }
    (item as any).style = style as any;
  }

  /**
   * Apply text element properties such as content and style to a widget.
   */
  private applyTextElement(
    item: BaseItem,
    element: TemplateElement,
    label: string,
  ): void {
    (item as any).content = (element.text ?? '{{label}}').replace(
      '{{label}}',
      label,
    );
    if (element.style) {
      (item as any).style = {
        ...((item as any).style ?? {}),
        ...(element.style as any),
      };
    }
  }

  /**
   * Route element application based on widget type.
   * Shapes and text widgets share most properties but are handled separately.
   */
  private applyElementToItem(
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
   * Update an already existing widget group or shape using the provided
   * template definition.
   */
  private async updateExistingNode(
    existing: BaseItem | Group,
    definition: TemplateDefinition,
    node: NodeData,
  ): Promise<BaseItem | Group> {
    if ((existing as Group).type === 'group') {
      const items = await (existing as Group).getItems();
      await Promise.all(
        items.slice(0, definition.elements.length).map((item, i) => {
          this.applyElementToItem(
            item as BaseItem,
            definition.elements[i],
            node.label,
          );
          return item.setMetadata(META_KEY, {
            type: node.type,
            label: node.label,
          });
        }),
      );
      return existing as Group;
    }
    this.applyElementToItem(
      existing as BaseItem,
      definition.elements[0],
      node.label,
    );
    await (existing as BaseItem).setMetadata(META_KEY, {
      type: node.type,
      label: node.label,
    });
    return existing as BaseItem;
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
        items.map(item =>
          item.setMetadata(META_KEY, { type: node.type, label: node.label }),
        ),
      );
      return widget as Group;
    }
    await (widget as BaseItem).setMetadata(META_KEY, {
      type: node.type,
      label: node.label,
    });
    if (this.shapeCache) {
      this.shapeCache.push(widget as BaseItem);
    }
    return widget as BaseItem;
  }

  /** Create or update a node widget from a template. */
  public async createNode(
    node: NodeData,
    pos: PositionedNode,
  ): Promise<BaseItem | Group> {
    if (!node || typeof node !== 'object') {
      throw new Error('Invalid node');
    }
    if (!pos || typeof pos.x !== 'number' || typeof pos.y !== 'number') {
      throw new Error('Invalid position');
    }
    const templateDef = templateManager.getTemplate(node.type);
    if (!templateDef) {
      throw new Error(`Template '${node.type}' not found`);
    }
    const existing = await this.findNode(node.type, node.label);
    if (existing) {
      return this.updateExistingNode(
        existing as BaseItem | Group,
        templateDef,
        node,
      );
    }
    return this.createNewNode(node, pos);
  }

  /**
   * Apply metadata and styling updates to an existing connector widget.
   */
  private updateConnector(
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
          textAlignVertical: template?.caption?.textAlignVertical as any,
        },
      ];
    }
    if (template?.style) {
      connector.style = {
        ...connector.style,
        ...template.style,
      } as ConnectorStyle as any;
    }
    connector.shape = template?.shape ?? connector.shape;
    if (hint?.startPosition) {
      connector.start = {
        ...(connector.start ?? {}),
        position: hint.startPosition,
      } as any;
    }
    if (hint?.endPosition) {
      connector.end = {
        ...(connector.end ?? {}),
        position: hint.endPosition,
      } as any;
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
              textAlignVertical: template?.caption?.textAlignVertical as any,
            },
          ]
        : undefined,
      style: template?.style as any,
    });
    connector.setMetadata(META_KEY, {
      from: edge.from,
      to: edge.to,
    });
    if (this.connectorCache) {
      this.connectorCache.push(connector);
    }
    return connector;
  }

  /** Create connectors with labels, metadata and optional snap hints. */
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
        const template = templateManager.getConnectorTemplate(
          (edge.metadata as any)?.template || 'default',
        );
        const existing = await this.findConnector(edge.from, edge.to);
        if (existing) {
          this.updateConnector(existing, edge, template, hints?.[i]);
          return existing;
        }
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
      items
        .filter(i => typeof (i as any).sync === 'function')
        .map(i => (i as any).sync()),
    );
  }

  /** Remove the provided widgets from the board. */
  public async removeItems(
    items: Array<BaseItem | Group | Connector | Frame>,
  ): Promise<void> {
    this.ensureBoard();
    await Promise.all(items.map(i => miro.board.remove(i as any)));
  }
}

interface NodeMetadata {
  type: string;
  label: string;
}

interface EdgeMetadata {
  from: string;
  to: string;
}
