import { connectorTemplates, templateManager } from '../src/templates';

// Simple tests for template helper functions

test('template helpers return values or undefined', () => {
  // Known templates return values
  expect(templateManager.getTemplate('Role')).toBeDefined();
  // Unknown template returns undefined
  expect(templateManager.getTemplate('nope')).toBeUndefined();
  (connectorTemplates as any).extra = { shape: 'straight' };
  // Connector template lookup should return our extra entry
  const tpl = templateManager.getConnectorTemplate('extra');
  expect(tpl?.shape).toBe('straight');
  // Missing connectors return undefined
  expect(templateManager.getConnectorTemplate('missing')).toBeUndefined();
  delete (connectorTemplates as any).extra;
});
