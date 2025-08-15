import { graphService } from '../src/core/graph';
import { GraphProcessor } from '../src/core/graph/graph-processor';

/**
 * Tests for the processFile helper method which loads a graph
 * from a file before processing.
 */

describe('GraphProcessor.processFile', () => {
  afterEach(() => jest.restoreAllMocks());

  test('throws on invalid file', async () => {
    const gp = new GraphProcessor();
    // Passing null should reject immediately
    await expect(gp.processFile(null as unknown as File)).rejects.toThrow(
      'Invalid file',
    );
  });

  test('loads graph then processes it', async () => {
    const gp = new GraphProcessor();
    const mockGraph = { nodes: [], edges: [] } as Parameters<
      GraphProcessor['processGraph']
    >[0];
    // Stub out loadAnyGraph and internal processGraph
    jest.spyOn(graphService, 'loadAnyGraph').mockResolvedValue(mockGraph);
    const processSpy = jest
      .spyOn(
        gp as unknown as {
          processGraph: (g: unknown, o?: unknown) => Promise<void>;
        },
        'processGraph',
      )
      .mockResolvedValue(undefined);
    const file = { name: 'g.json' } as unknown as File;
    await gp.processFile(file);
    expect(graphService.loadAnyGraph).toHaveBeenCalledWith(file);
    expect(processSpy).toHaveBeenCalledWith(mockGraph, {});
  });
});
