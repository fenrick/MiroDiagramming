import { renderNodes } from '../src/logic/shapeRenderer';
import * as metadata from '../src/logic/metadata';

describe('renderNodes', () => {
  const createShape = jest.fn();
  const group = jest.fn();
  beforeEach(() => {
    Object.assign(globalThis, { miro: { board: { createShape, group } } });
    createShape.mockReset();
    group.mockReset();
    jest.spyOn(metadata, 'attachShapeMetadata').mockImplementation((s) => s);
  });

  test('creates widgets and returns mapping', async () => {
    const shape1 = { id: 'w1' };
    const shape2 = { id: 'w2' };
    createShape.mockResolvedValueOnce(shape1).mockResolvedValueOnce(shape2);
    group
      .mockResolvedValueOnce({ id: 'g1' })
      .mockResolvedValueOnce({ id: 'g2' });
    const nodes = [
      { id: 'n1', x: 0, y: 0, width: 50, height: 50, label: 'A' },
      { id: 'n2', x: 10, y: 10, width: 50, height: 50, label: 'B' },
    ];
    const map = await renderNodes(nodes);
    expect(createShape).toHaveBeenCalledTimes(2);
    expect(group).toHaveBeenCalledTimes(2);
    expect(metadata.attachShapeMetadata).toHaveBeenCalledWith(shape1, {
      type: 'node',
      nodeId: 'n1',
      groupId: 'g1',
    });
    expect(metadata.attachShapeMetadata).toHaveBeenCalledWith(shape2, {
      type: 'node',
      nodeId: 'n2',
      groupId: 'g2',
    });
    expect(map).toEqual({ n1: shape1, n2: shape2 });
  });

  test('applies template colors to style', async () => {
    const widget = { id: 'w1' };
    createShape.mockResolvedValueOnce(widget);
    group.mockResolvedValueOnce({ id: 'g1' });
    await renderNodes([
      {
        id: 'n1',
        type: 'BusinessService',
        x: 0,
        y: 0,
        width: 50,
        height: 50,
        label: 'A',
      },
    ]);
    expect(createShape).toHaveBeenCalledWith(
      expect.objectContaining({
        style: { fillColor: '#FFEECC', color: '#000000' },
      })
    );
  });
});
