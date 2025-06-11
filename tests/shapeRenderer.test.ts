import { renderNodes } from '../src/logic/shapeRenderer';
import * as metadata from '../src/logic/metadata';

describe('renderNodes', () => {
  const createShape = jest.fn();
  beforeEach(() => {
    Object.assign(globalThis, { miro: { board: { createShape } } });
    createShape.mockReset();
    jest.spyOn(metadata, 'attachShapeMetadata').mockImplementation((s) => s);
  });

  test('creates widgets and returns mapping', async () => {
    const shape1 = { id: 'w1' };
    const shape2 = { id: 'w2' };
    createShape.mockResolvedValueOnce(shape1).mockResolvedValueOnce(shape2);
    const nodes = [
      { id: 'n1', x: 0, y: 0, width: 50, height: 50, label: 'A' },
      { id: 'n2', x: 10, y: 10, width: 50, height: 50, label: 'B' },
    ];
    const map = await renderNodes(nodes);
    expect(createShape).toHaveBeenCalledTimes(2);
    expect(map).toEqual({ n1: shape1, n2: shape2 });
  });
});
