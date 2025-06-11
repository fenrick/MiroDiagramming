import { renderEdges } from '../src/logic/edgeRenderer';
import * as metadata from '../src/logic/metadata';

describe('renderEdges', () => {
  const createConnector = jest.fn();
  const widgets = { n1: { id: 'w1' }, n2: { id: 'w2' } };

  beforeEach(() => {
    Object.assign(globalThis, { miro: { board: { createConnector } } });
    createConnector.mockReset();
    jest.spyOn(metadata, 'attachConnectorMetadata').mockImplementation((c) => c);
  });

  test('creates connectors between widgets', async () => {
    const conn = { id: 'c1' };
    createConnector.mockResolvedValue(conn);
    const edges = [{ id: 'e1', source: 'n1', target: 'n2' }];
    const result = await renderEdges(edges, widgets);
    expect(createConnector).toHaveBeenCalledWith({
      start: { item: 'w1' },
      end: { item: 'w2' },
      captions: undefined,
    });
    expect(result).toEqual([conn]);
  });
});
