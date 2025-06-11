import { runLayout } from '../src/logic/layoutEngine';
import ELK from 'elkjs/lib/elk.bundled.js';

const mockLayout = jest.fn();

jest.mock('elkjs/lib/elk.bundled.js', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({ layout: mockLayout })),
}));

beforeEach(() => {
  mockLayout.mockReset();
});

describe('runLayout', () => {
  test('returns positioned nodes with layout sizes', async () => {
    const mockResult = {
      children: [{ id: 'n1', x: 10, y: 15, width: 150, height: 80 }],
      edges: [],
    };
    mockLayout.mockResolvedValueOnce(mockResult);

    const input = { nodes: [{ id: 'n1' }], edges: [] };
    const result = await runLayout(input);
    expect(result.nodes[0]).toEqual(
      expect.objectContaining({ id: 'n1', width: 150, height: 80 })
    );
  });

  test('passes graph with nodes and edges to ELK', async () => {
    mockLayout.mockResolvedValueOnce({ children: [], edges: [] });

    const input = {
      nodes: [{ id: 'a' }, { id: 'b' }],
      edges: [{ source: 'a', target: 'b' }],
    };
    await runLayout(input);

    expect(mockLayout).toHaveBeenCalledTimes(1);
    const graph = mockLayout.mock.calls[0][0];
    expect(graph.children).toEqual([
      { id: 'a', width: 150, height: 80 },
      { id: 'b', width: 150, height: 80 },
    ]);
    expect(graph.edges).toEqual([
      { id: 'a-b', sources: ['a'], targets: ['b'] },
    ]);
  });

  test('returns routed edges from elk result', async () => {
    const mockResult = {
      children: [],
      edges: [
        {
          id: 'e1',
          sources: ['n1'],
          targets: ['n2'],
          sections: [
            {
              startPoint: { x: 0, y: 0 },
              endPoint: { x: 1, y: 1 },
            },
          ],
        },
      ],
    };
    mockLayout.mockResolvedValueOnce(mockResult);

    const input = {
      nodes: [{ id: 'n1' }, { id: 'n2' }],
      edges: [{ id: 'e1', source: 'n1', target: 'n2' }],
    };
    const result = await runLayout(input);

    expect(result.edges[0]).toEqual(
      expect.objectContaining({
        id: 'e1',
        sections: mockResult.edges[0].sections,
      })
    );
  });
});
