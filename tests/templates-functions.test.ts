import { getTemplate, getConnectorTemplate, templates, connectorTemplates } from '../src/templates';

test('template helpers return values or undefined', () => {
  expect(getTemplate('Role')).toBeDefined();
  expect(getTemplate('nope')).toBeUndefined();
  (connectorTemplates as any).extra = { shape: 'straight' };
  const tpl = getConnectorTemplate('extra');
  expect(tpl?.shape).toBe('straight');
  expect(getConnectorTemplate('missing')).toBeUndefined();
  delete (connectorTemplates as any).extra;
});
