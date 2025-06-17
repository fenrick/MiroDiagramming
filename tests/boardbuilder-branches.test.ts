import { BoardBuilder } from '../src/BoardBuilder';
import * as templates from '../src/templates';

/**
 * Unit tests targeting rarely hit branches within BoardBuilder
 * to increase overall coverage.
 */

describe('BoardBuilder branch coverage', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    delete (global as any).miro;
  });

  test('findNode searches groups', async () => {
    // Mock a group containing an item whose metadata matches the search
    const item = { getMetadata: jest.fn().mockResolvedValue({ type: 'Role', label: 'A' }) } as any;
    const group = { getItems: jest.fn().mockResolvedValue([item]) } as any;
    // `board.get` first returns no shapes then a single group
    (global as any).miro = { board: { get: jest.fn().mockResolvedValueOnce([]).mockResolvedValueOnce([group]) } };
    const builder = new BoardBuilder();
    // Expect the builder to return the matching group
    const res = await builder.findNode('Role', 'A');
    expect(res).toBe(group);
  });

  test('createNode applies fill color when style missing', async () => {
    const builder = new BoardBuilder();
    // Element template providing default fill style
    const el = { shape: 'rect', fill: '#fff', width: 10, height: 10 };
    const shape = { type: 'shape', style: {}, setMetadata: jest.fn() } as any;
    // Pretend the node does not already exist
    jest.spyOn(builder, 'findNode').mockResolvedValue(undefined);
    // Template lookup returns our element
    jest.spyOn(templates, 'getTemplate').mockReturnValue({ elements: [el] });
    // createFromTemplate applies the element to the new shape
    jest.spyOn(templates, 'createFromTemplate').mockImplementation(async () => {
      (builder as any).applyShapeElement(shape, el, 'L');
      return shape;
    });
    await builder.createNode({ id: 'n', label: 'L', type: 'fill' } as any, { x: 0, y: 0, width: 1, height: 1 });
    // The fill color from the element should be applied
    expect(shape.style.fillColor).toBe('#fff');
  });

  test('applyTextElement merges style when provided', () => {
    const builder = new BoardBuilder();
    const item: any = { type: 'text', style: { fontSize: 10 } };
    const el = { text: 'T', style: { color: 'red' } } as any;
    // Applying a text element should merge the style properties
    (builder as any).applyTextElement(item, el, 'L');
    expect(item.style.color).toBe('red');
    expect(item.style.fontSize).toBe(10);
  });
});
