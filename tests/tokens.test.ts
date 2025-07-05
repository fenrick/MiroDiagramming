import { tokens } from '../src/ui/tokens';
import { colors, fontWeights, fontSizes, space } from '@mirohq/design-tokens';

describe('design token mapping', () => {
  test('color mappings', () => {
    expect(tokens.color.red[700]).toBe(colors['red-700']);
    expect(tokens.color.green[150]).toBe(colors['green-150']);
  });

  test('typography mappings', () => {
    expect(tokens.typography.fontWeight.bold).toBe(fontWeights.semibold);
    expect(tokens.typography.fontSize.large).toBe(fontSizes[200]);
  });

  test('space mappings', () => {
    expect(tokens.space.small).toBe(space[200]);
    expect(tokens.space.xlarge).toBe(space[500]);
  });
});
