import { Shape, Connector } from '@mirohq/websdk-types';

/** Metadata stored on board items created by this app. */
export interface StructuredGraphMetadata {
  /** Discriminator describing the type of the item. */
  type: 'node' | 'edge';
  /** ID of the associated node widget. */
  nodeId?: string;
  /** ID of the widget group containing the node. */
  groupId?: string;
  /** Unique ID of the edge widget. */
  edgeId?: string;
  /** Source node identifier of the edge. */
  source?: string;
  /** Target node identifier of the edge. */
  target?: string;
}

/**
 * Attach structured graph metadata under the namespace `app.miro.structgraph`.
 *
 * @param shape - Widget to annotate.
 * @param data - Arbitrary metadata value to store.
 * @returns The same shape instance for chaining.
 */
export function attachShapeMetadata(
  shape: Shape,
  data: StructuredGraphMetadata
): Shape {
  if (shape) {
    shape.setMetadata('app.miro.structgraph', data);
    shape.sync();
  }
  return shape;
}

/**
 * Attach structured graph metadata under the namespace `app.miro.structgraph`.
 *
 * @param connector - Connector widget to annotate.
 * @param data - Arbitrary metadata value to store.
 * @returns The same connector instance for chaining.
 */
export function attachConnectorMetadata(
  connector: Connector,
  data: StructuredGraphMetadata
): Connector {
  if (connector) {
    connector.setMetadata('app.miro.structgraph', data);
    connector.sync();
  }
  return connector;
}
