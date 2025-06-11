import { Shape, Connector, AppDataValue } from '@mirohq/websdk-types';

/**
 * Attach structured graph metadata under the namespace 'app.miro.structgraph'.
 */
export function attachShapeMetadata(shape: Shape, data: AppDataValue): Shape {
  if (shape) {
    shape.setMetadata('app.miro.structgraph', data);
    shape.sync();
  }
  return shape;
}

/**
 * Attach structured graph metadata under the namespace 'app.miro.structgraph'.
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
