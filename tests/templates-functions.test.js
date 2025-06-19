'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var templates_1 = require('../src/templates');
// Simple tests for template helper functions
test('template helpers return values or undefined', function () {
  // Known templates return values
  expect(templates_1.templateManager.getTemplate('Role')).toBeDefined();
  // Unknown template returns undefined
  expect(templates_1.templateManager.getTemplate('nope')).toBeUndefined();
  templates_1.connectorTemplates.extra = {
    shape: 'straight',
  };
  // Connector template lookup should return our extra entry
  var tpl = templates_1.templateManager.getConnectorTemplate('extra');
  expect(tpl === null || tpl === void 0 ? void 0 : tpl.shape).toBe('straight');
  // Missing connectors return undefined
  expect(
    templates_1.templateManager.getConnectorTemplate('missing'),
  ).toBeUndefined();
  delete templates_1.connectorTemplates.extra;
});
