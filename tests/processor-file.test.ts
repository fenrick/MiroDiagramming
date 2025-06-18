import { GraphProcessor } from '../src/GraphProcessor';
import { graphService } from '../src/graph';

/**
 * Tests for the processFile helper method which loads a graph
 * from a file before processing.
 */

describe('GraphProcessor.processFile', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('throws on invalid file', async () => {
    const gp = new GraphProcessor();
    // Passing null should reject immediately
    await expect(gp.processFile(null as any)).rejects.toThrow('Invalid file');
  });

  test('loads graph then processes it', async () => {
    const gp = new GraphProcessor();
    const mockGraph = { nodes: [], edges: [] } as any;
    // Stub out loadGraph and internal processGraph
    jest.spyOn(graphService, 'loadGraph').mockResolvedValue(mockGraph);
    const processSpy = jest
      .spyOn(gp as any, 'processGraph')
      .mockResolvedValue(undefined);
    const file = { name: 'g.json' } as any;
    await gp.processFile(file);
    expect(graphService.loadGraph).toHaveBeenCalledWith(file);
    expect(processSpy).toHaveBeenCalledWith(mockGraph, {});
  });
});
