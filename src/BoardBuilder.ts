import {
  createFromTemplate,
  getConnectorTemplate,
  getTemplate,
} from './templates';
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
    if (!(globalThis as any).miro?.board) {
      throw new Error('Miro board not initialized');
    }
  }

  /** Assign a parent frame for subsequently created items. */
  public setFrame(frame: Frame | undefined): void {
    this.frame = frame;
  }

  /**
   * Find a free area on the board that can fit the given dimensions.
   * This uses the built-in `findEmptySpace` API starting from the
   * current viewport center.
   */
  public async findSpace(
    width: number,
    height: number
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
    title?: string
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

  /** Move the viewport to show provided bounds. */
  public async zoomTo(bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  }): Promise<void> {
    this.ensureBoard();
    if (miro.board.viewport?.set) {
      await miro.board.viewport.set({ viewport: bounds });
    } else if (miro.board.viewport?.zoomTo) {
      const temp = await miro.board.createFrame({
        title: '',
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
      });
      await miro.board.viewport.zoomTo(temp);
      await (temp as any).remove();
    }
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

  private async searchShapes(
    type: string,
    label: string
  ): Promise<BaseItem | Group | undefined> {
    await this.loadShapeCache();
    for (const item of this.shapeCache ?? []) {
      const raw = await item.getMetadata('app.miro.structgraph');
      const meta = raw as unknown as NodeMetadata | undefined;
      if (meta?.type === type && meta.label === label) {
        return item as BaseItem;
      }
    }
    return undefined;
  }

  private async searchGroups(
    type: string,
    label: string
  ): Promise<BaseItem | Group | undefined> {
    this.ensureBoard();
    const groups = (await miro.board.get({ type: 'group' })) as Group[];
    for (const group of groups) {
      const items = await group.getItems();
      if (!Array.isArray(items)) continue;
      for (const item of items) {
        const raw = await item.getMetadata('app.miro.structgraph');
        const meta = raw as unknown as NodeMetadata | undefined;
        if (meta?.type === type && meta.label === label) {
          return group as Group;
        }
      }
    }
    return undefined;
  }

  /** Lookup an existing widget with matching metadata. */
  public async findNode(
    type: string,
    label: string
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
    to: string
  ): Promise<Connector | undefined> {
    if (typeof from !== 'string' || typeof to !== 'string') {
      throw new Error('Invalid search parameters');
    }
    await this.loadConnectorCache();
    for (const conn of this.connectorCache ?? []) {
      const raw = await conn.getMetadata('app.miro.structgraph');
      const meta = raw as unknown as EdgeMetadata | undefined;
      if (meta?.from === from && meta.to === to) {
        return conn as Connector;
      }
    }
    return undefined;
  }

  private applyShapeElement(
    item: BaseItem,
    el: TemplateElement,
    label: string
  ): void {
    if (el.shape) (item as any).shape = el.shape;
    if (el.rotation !== undefined) (item as any).rotation = el.rotation;
    if (el.width) (item as any).width = el.width;
    if (el.height) (item as any).height = el.height;
    (item as any).content = (el.text ?? '{{label}}').replace(
      '{{label}}',
      label
    );
    const existing = (item as any).style ?? {};
    const style: Record<string, unknown> = {
      ...existing,
      ...(el.style ?? {}),
    };
    if (el.fill && !('fillColor' in style)) {
      (style as any).fillColor = el.fill;
    }
    (item as any).style = style as any;
  }

  private applyTextElement(
    item: BaseItem,
    el: TemplateElement,
    label: string
  ): void {
    (item as any).content = (el.text ?? '{{label}}').replace(
      '{{label}}',
      label
    );
    if (el.style) {
      (item as any).style = {
        ...((item as any).style ?? {}),
        ...(el.style as any),
      };
    }
  }

  private applyElementToItem(
    item: BaseItem,
    el: TemplateElement,
    label: string
  ): void {
    if (item.type === 'shape') {
      this.applyShapeElement(item, el, label);
    } else if (item.type === 'text') {
      this.applyTextElement(item, el, label);
    }
  }

  private async updateExistingNode(
    existing: BaseItem | Group,
    def: TemplateDefinition,
    node: NodeData
  ): Promise<BaseItem | Group> {
    if ((existing as Group).type === 'group') {
      const items = await (existing as Group).getItems();
      for (let i = 0; i < items.length && i < def.elements.length; i++) {
        this.applyElementToItem(
          items[i] as BaseItem,
          def.elements[i],
          node.label
        );
        await items[i].setMetadata('app.miro.structgraph', {
          type: node.type,
          label: node.label,
        });
      }
      return existing as Group;
    }
    this.applyElementToItem(existing as BaseItem, def.elements[0], node.label);
    await (existing as BaseItem).setMetadata('app.miro.structgraph', {
      type: node.type,
      label: node.label,
    });
    return existing as BaseItem;
  }

  private async createNewNode(
    node: NodeData,
    pos: PositionedNode
  ): Promise<BaseItem | Group> {
    const widget = await createFromTemplate(
      node.type,
      node.label,
      pos.x,
      pos.y,
      this.frame
    );
    if ((widget as Group).type === 'group') {
      const items = await (widget as Group).getItems();
      for (const item of items) {
        await item.setMetadata('app.miro.structgraph', {
          type: node.type,
          label: node.label,
        });
      }
      return widget as Group;
    }
    await (widget as BaseItem).setMetadata('app.miro.structgraph', {
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
    pos: PositionedNode
  ): Promise<BaseItem | Group> {
    if (!node || typeof node !== 'object') {
      throw new Error('Invalid node');
    }
    if (!pos || typeof pos.x !== 'number' || typeof pos.y !== 'number') {
      throw new Error('Invalid position');
    }
    const templateDef = getTemplate(node.type);
    if (!templateDef) {
      throw new Error(`Template '${node.type}' not found`);
    }
    const existing = await this.findNode(node.type, node.label);
    if (existing) {
      return this.updateExistingNode(
        existing as BaseItem | Group,
        templateDef,
        node
      );
    }
    return this.createNewNode(node, pos);
  }

  private updateConnector(
    connector: Connector,
    edge: EdgeData,
    template?: ConnectorTemplate
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
  }

  private async createConnector(
    edge: EdgeData,
    from: BaseItem | Group,
    to: BaseItem | Group,
    hint: EdgeHint | undefined,
    template?: ConnectorTemplate
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
    connector.setMetadata('app.miro.structgraph', {
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
    hints?: EdgeHint[]
  ): Promise<Connector[]> {
    if (!Array.isArray(edges)) {
      throw new Error('Invalid edges');
    }
    if (!nodeMap || typeof nodeMap !== 'object') {
      throw new Error('Invalid node map');
    }
    const connectors: Connector[] = [];
    for (let i = 0; i < edges.length; i++) {
      const edge = edges[i];
      const from = nodeMap[edge.from];
      const to = nodeMap[edge.to];
      if (!from || !to) continue;
      const template = getConnectorTemplate(
        (edge.metadata as any)?.template || 'default'
      );
      const existing = await this.findConnector(edge.from, edge.to);
      if (existing) {
        this.updateConnector(existing, edge, template);
        connectors.push(existing);
        continue;
      }
      const connector = await this.createConnector(
        edge,
        from,
        to,
        hints?.[i],
        template
      );
      connectors.push(connector);
    }
    return connectors;
  }

  /** Call `.sync()` on each widget if the method exists. */
  public async syncAll(
    items: Array<BaseItem | Group | Connector>
  ): Promise<void> {
    for (const item of items) {
      if (typeof (item as any).sync === 'function') {
        await (item as any).sync();
      }
    }
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
