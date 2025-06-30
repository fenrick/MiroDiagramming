import { connectorTemplates, templateManager } from '../src/board/templates';

// Simple tests for template helper functions

test('template helpers return values or undefined', () => {
  // Known templates return values
  expect(templateManager.getTemplate('Role')).toBeDefined();
  // Unknown template returns undefined
  expect(templateManager.getTemplate('nope')).toBeUndefined();
  (connectorTemplates as unknown as Record<string, unknown>).extra = {
    shape: 'straight',
  };
  // Connector template lookup should return our extra entry
  const tpl = templateManager.getConnectorTemplate('extra');
  expect(tpl?.shape).toBe('straight');
  // Missing connectors return undefined
  expect(templateManager.getConnectorTemplate('missing')).toBeUndefined();
  delete (connectorTemplates as unknown as Record<string, unknown>).extra;
});

describe('token resolution', () => {
  test('resolves color tokens to hex', () => {
    const style = templateManager.resolveStyle({
      fillColor: 'tokens.color.red[700]',
    });
    expect(style.fillColor).toBe('#6b1720');
  });

  test('returns raw value for unknown tokens', () => {
    const style = templateManager.resolveStyle({ something: 'tokens.foo.bar' });
    expect(style.something).toBe('tokens.foo.bar');
  });

  test('looks up generic tokens', () => {
    const style = templateManager.resolveStyle({ gap: 'tokens.space.small' });
    expect(style.gap).toBe('var(--space-small)');
  });
});
