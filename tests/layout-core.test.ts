import { jest } from '@jest/globals';
import { performLayout } from '../src/core/layout/layout-core';
import { templateManager } from '../src/board/templates';
import ELK from 'elkjs/lib/elk.bundled.js';

/** Branch coverage tests for performLayout. */
describe('performLayout', () => {
  test('falls back to defaults when template missing', async () => {
    jest
      .spyOn(templateManager, 'getTemplate')
      .mockReturnValue(
        undefined as unknown as ReturnType<typeof templateManager.getTemplate>,
      );
    jest
      .spyOn(ELK.prototype, 'layout')
      .mockResolvedValue({ children: [{ id: 'a' }], edges: [] } as unknown);

    const result = await performLayout({
      nodes: [{ id: 'a', type: 'X' }],
      edges: [],
    });
    expect(result.nodes.a.width).toBeGreaterThan(0);
    (templateManager.getTemplate as jest.Mock).mockRestore();
    (ELK.prototype.layout as jest.Mock).mockRestore();
  });
});
