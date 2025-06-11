import { runLayout } from '../src/logic/layoutEngine';
import ELK from 'elkjs/lib/elk.bundled.js';

const mockLayout = jest.fn();

jest.mock('elkjs/lib/elk.bundled.js', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({ layout: mockLayout })),
}));

const mockResult = {
  children: [{ id: 'n1', x: 10, y: 15, width: 150, height: 80 }],
  edges: [],
};

mockLayout.mockResolvedValue(mockResult);

describe('runLayout', () => {
  test('returns positioned nodes with layout sizes', async () => {
    const input = { nodes: [{ id: 'n1' }], edges: [] };
    const result = await runLayout(input);
    expect(result.nodes[0]).toEqual(
      expect.objectContaining({ id: 'n1', width: 150, height: 80 })
    );
  });
});
