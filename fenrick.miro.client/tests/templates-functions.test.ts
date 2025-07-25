import { connectorTemplates, templateManager } from '../src/board/templates';

// Simple tests for template helper functions

test('template helpers return values or undefined', () => {
  // Known templates return values
  expect(templateManager.getTemplate('Motivation')).toBeDefined();
  // Alias names also resolve
  expect(templateManager.getTemplate('Stakeholder')).toBeDefined();
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

test('connector aliases resolve correctly', () =>
  expect(templateManager.getConnectorTemplate('deploy')).toBeDefined());

test('resolveStyle substitutes tokens', () => {
  const style = templateManager.resolveStyle({
    fillColor: 'tokens.color.yellow[150]',
    missing: 'tokens.color.nope[999]',
  });
  expect(style.fillColor).toMatch(/^#/);
  expect(style.missing).toBeDefined();
});

describe('token resolution', () => {
  test('resolves color tokens to hex', () => {
    const style = templateManager.resolveStyle({
      fillColor: 'tokens.color.red[700]',
    });
    expect(style.fillColor.toLowerCase()).toBe('#6b1720');
  });

  test('returns raw value for unknown tokens', () => {
    const style = templateManager.resolveStyle({ something: 'tokens.foo.bar' });
    expect(style.something).toBe('tokens.foo.bar');
  });

  test('parses numeric values', () => {
    const style = templateManager.resolveStyle({
      borderWidth: '2px',
      borderColor: '#123456',
    });
    expect(style.borderWidth).toBe(2);
    expect(style.borderColor).toBe('#123456');
  });
});
