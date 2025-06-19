'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var file_utils_1 = require('../src/file-utils');
describe('FileUtils singleton', function () {
  test('getInstance returns same instance', function () {
    var original = file_utils_1.FileUtils.instance;
    file_utils_1.FileUtils.instance = undefined;
    var first = file_utils_1.FileUtils.getInstance();
    var second = file_utils_1.FileUtils.getInstance();
    expect(second).toBe(first);
    file_utils_1.FileUtils.instance = original;
  });
});
