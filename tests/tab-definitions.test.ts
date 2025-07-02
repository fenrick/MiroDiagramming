import { describe, test, expect } from 'vitest';
import { COMMANDS } from '../src/ui/pages/tab-definitions';
import type { TabId } from '../src/ui/pages/tab-definitions';

/** Valid TabId values for runtime validation. */
const VALID_IDS: TabId[] = [
  'diagrams',
  'tools',
  'size',
  'style',
  'arrange',
  'frames',
  'excel',
  'search',
  'help',
  'dummy',
];

describe('tab-definitions', () => {
  test('each exported tab definition is valid', async () => {
    const { TAB_DATA } = await import('../src/ui/pages/tabs.ts?test');

    TAB_DATA.forEach(([order, id, label, instructions, Comp]) => {
      expect(typeof order).toBe('number');
      expect(VALID_IDS.includes(id as TabId)).toBe(true);
      expect(typeof label).toBe('string');
      expect(typeof instructions).toBe('string');
      expect(typeof Comp).toBe('function');
    });

    // ensure constants in tab-definitions are executed for coverage
    expect(COMMANDS.length).toBeGreaterThan(0);
  });
});
