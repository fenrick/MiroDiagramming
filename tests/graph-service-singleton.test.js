'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
var graph_1 = require('../src/core/graph');
describe('GraphService singleton', function () {
  test('getInstance returns the same object', function () {
    var original = graph_1.GraphService.instance;
    graph_1.GraphService.instance = undefined;
    var first = graph_1.GraphService.getInstance();
    var second = graph_1.GraphService.getInstance();
    expect(second).toBe(first);
    graph_1.GraphService.instance = original;
  });
});
