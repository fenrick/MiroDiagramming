import {
  getTemplate,
  getConnectorTemplate,
  templates,
  connectorTemplates,
} from '../src/templates';

// Simple tests for template helper functions

test('template helpers return values or undefined', () => {
  // Known templates return values
  expect(getTemplate('Role')).toBeDefined();
  // Unknown template returns undefined
  expect(getTemplate('nope')).toBeUndefined();
  (connectorTemplates as any).extra = { shape: 'straight' };
  // Connector template lookup should return our extra entry
  const tpl = getConnectorTemplate('extra');
  expect(tpl?.shape).toBe('straight');
  // Missing connectors return undefined
  expect(getConnectorTemplate('missing')).toBeUndefined();
  delete (connectorTemplates as any).extra;
});
