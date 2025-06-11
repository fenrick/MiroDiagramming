import {
  attachShapeMetadata,
  attachConnectorMetadata,
} from '../src/logic/metadata';

describe('metadata helpers', () => {
  test('attachShapeMetadata returns shape after setting metadata', () => {
    const shape = { setMetadata: jest.fn(), sync: jest.fn() } as any;
    const data = { key: 'value' };
    const result = attachShapeMetadata(shape, data);
    expect(result).toBe(shape);
    expect(shape.setMetadata).toHaveBeenCalledWith(
      'app.miro.structgraph',
      data
    );
    expect(shape.sync).toHaveBeenCalled();
  });

  test('attachConnectorMetadata returns connector after setting metadata', () => {
    const connector = { setMetadata: jest.fn(), sync: jest.fn() } as any;
    const data = { key: 'value' };
    const result = attachConnectorMetadata(connector, data);
    expect(result).toBe(connector);
    expect(connector.setMetadata).toHaveBeenCalledWith(
      'app.miro.structgraph',
      data
    );
    expect(connector.sync).toHaveBeenCalled();
  });
});
