import { vi } from 'vitest';
import {
  performLayout,
  getNodeDimensions,
  buildElkGraphOptions,
} from '../src/core/layout/layout-core';
import { templateManager } from '../src/board/templates';
import ELK from 'elkjs/lib/elk.bundled.js';

/** Branch coverage tests for performLayout. */
describe('performLayout', () => {
  test('falls back to defaults when template missing', async () => {
    vi.spyOn(templateManager, 'getTemplate').mockReturnValue(
      undefined as unknown as ReturnType<typeof templateManager.getTemplate>,
    );
    vi.spyOn(ELK.prototype, 'layout').mockResolvedValue({
      children: [{ id: 'a' }],
      edges: [],
    } as unknown);

    const result = await performLayout({
      nodes: [{ id: 'a', type: 'X' }],
      edges: [],
    });
    expect(result.nodes.a.width).toBeGreaterThan(0);
    (templateManager.getTemplate as vi.Mock).mockRestore();
    (ELK.prototype.layout as vi.Mock).mockRestore();
  });
});

describe('getNodeDimensions', () => {
  test('uses metadata when present', () => {
    vi.spyOn(templateManager, 'getTemplate').mockReturnValue({
      elements: [{ width: 10, height: 10 }],
    });
    const dims = getNodeDimensions({
      type: 'T',
      metadata: { width: 20, height: 30 },
    });
    expect(dims).toEqual({ width: 20, height: 30 });
    (templateManager.getTemplate as vi.Mock).mockRestore();
  });

  test('falls back to template values', () => {
    vi.spyOn(templateManager, 'getTemplate').mockReturnValue({
      elements: [{ width: 15, height: 25 }],
    });
    const dims = getNodeDimensions({ type: 'T' });
    expect(dims).toEqual({ width: 15, height: 25 });
    (templateManager.getTemplate as vi.Mock).mockRestore();
  });
});

describe('buildElkGraphOptions', () => {
  test('includes optional values when present', () => {
    const opts = {
      algorithm: 'layered',
      direction: 'DOWN',
      spacing: 30,
      aspectRatio: '16:9' as const,
      edgeRouting: 'SPLINES',
    } as const;
    const result = buildElkGraphOptions(opts);
    expect(result['elk.edgeRouting']).toBe('SPLINES');
    expect(result['elk.aspectRatio']).toBe(String(16 / 9));
  });
});
