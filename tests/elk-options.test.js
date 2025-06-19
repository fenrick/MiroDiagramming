'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var elk_options_1 = require('../src/elk-options');
describe('validateLayoutOptions', function () {
  test('returns defaults for invalid options', function () {
    var result = (0, elk_options_1.validateLayoutOptions)({
      algorithm: 'bad',
      spacing: -1,
    });
    expect(result).toEqual(elk_options_1.DEFAULT_LAYOUT_OPTIONS);
  });
  test('accepts valid options', function () {
    var result = (0, elk_options_1.validateLayoutOptions)({
      algorithm: 'force',
      direction: 'LEFT',
      spacing: 50,
    });
    expect(result).toEqual({
      algorithm: 'force',
      direction: 'LEFT',
      spacing: 50,
    });
  });
});
