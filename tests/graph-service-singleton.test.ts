import { GraphService } from '../src/graph';

describe('GraphService singleton', () => {
  test('getInstance returns the same object', () => {
    const original = (
      GraphService as unknown as { instance: GraphService | undefined }
    ).instance;
    (
      GraphService as unknown as { instance: GraphService | undefined }
    ).instance = undefined;
    const first = GraphService.getInstance();
    const second = GraphService.getInstance();
    expect(second).toBe(first);
    (
      GraphService as unknown as { instance: GraphService | undefined }
    ).instance = original;
  });
});
