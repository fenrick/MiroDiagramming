import { Shape, Connector, AppDataValue } from '@mirohq/websdk-types';

/**
 * Attach structured graph metadata under the namespace `app.miro.structgraph`.
 *
 * @param shape - Widget to annotate.
 * @param data - Arbitrary metadata value to store.
 * @returns The same shape instance for chaining.
 */
export function attachShapeMetadata(shape: Shape, data: AppDataValue): Shape {
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
  data: AppDataValue
): Connector {
  if (connector) {
    connector.setMetadata('app.miro.structgraph', data);
    connector.sync();
  }
  return connector;
}
