'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g = Object.create(
        (typeof Iterator === 'function' ? Iterator : Object).prototype,
      );
    return (
      (g.next = verb(0)),
      (g['throw'] = verb(1)),
      (g['return'] = verb(2)),
      typeof Symbol === 'function' &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError('Generator is already executing.');
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y['return']
                  : op[0]
                    ? y['throw'] || ((t = y['return']) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
Object.defineProperty(exports, '__esModule', { value: true });
var elk_layout_1 = require('../src/elk-layout');
var elk_bundled_js_1 = require('elkjs/lib/elk.bundled.js');
/**
 * Coverage tests for layoutGraph focusing on branch conditions
 * around metadata and edge sections.
 */
test('layoutGraph handles metadata and missing sections', function () {
  return __awaiter(void 0, void 0, void 0, function () {
    var layoutSpy, graph, result;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          layoutSpy = jest
            .spyOn(elk_bundled_js_1.default.prototype, 'layout')
            .mockImplementation(function (g) {
              return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                  // Validate that metadata dimensions are passed through
                  expect(g.children[0].width).toBe(99);
                  expect(g.children[0].height).toBe(88);
                  // Return layout with one edge lacking sections and one with sections
                  return [
                    2 /*return*/,
                    {
                      children: [
                        { id: 'n1', x: 1, y: 2, width: 50, height: 60 },
                      ],
                      edges: [
                        { id: 'e0', sections: [] },
                        {
                          id: 'e1',
                          sections: [
                            {
                              startPoint: { x: 0, y: 0 },
                              endPoint: { x: 10, y: 10 },
                              bendPoints: [{ x: 5, y: 5 }],
                            },
                          ],
                        },
                      ],
                    },
                  ];
                });
              });
            });
          graph = {
            nodes: [
              {
                id: 'n1',
                label: 'A',
                type: 'Role',
                metadata: { width: 99, height: 88 },
              },
            ],
            edges: [
              { from: 'n1', to: 'n1' },
              { from: 'n1', to: 'n1' },
            ],
          };
          return [4 /*yield*/, elk_layout_1.layoutEngine.layoutGraph(graph)];
        case 1:
          result = _a.sent();
          // Only the edge with sections should be included
          expect(result.nodes.n1.width).toBe(50);
          expect(result.edges).toHaveLength(1);
          layoutSpy.mockRestore();
          return [2 /*return*/];
      }
    });
  });
});
test('layoutGraph uses defaults when layout values missing', function () {
  return __awaiter(void 0, void 0, void 0, function () {
    var layoutSpy, graph, result;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          layoutSpy = jest
            .spyOn(elk_bundled_js_1.default.prototype, 'layout')
            .mockResolvedValue({
              children: [{ id: 'n2' }],
              edges: [],
            });
          graph = {
            nodes: [{ id: 'n2', label: 'B', type: 'Role' }],
            edges: [],
          };
          return [4 /*yield*/, elk_layout_1.layoutEngine.layoutGraph(graph)];
        case 1:
          result = _a.sent();
          // Defaults populate width and position
          expect(result.nodes.n2.width).toBeGreaterThan(0);
          expect(result.nodes.n2.x).toBe(0);
          layoutSpy.mockRestore();
          return [2 /*return*/];
      }
    });
  });
});
test('layoutGraph uses template dimensions when metadata absent', function () {
  return __awaiter(void 0, void 0, void 0, function () {
    var spy, graph;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          spy = jest
            .spyOn(elk_bundled_js_1.default.prototype, 'layout')
            .mockImplementation(function (g) {
              return __awaiter(void 0, void 0, void 0, function () {
                return __generator(this, function (_a) {
                  expect(g.children[0].width).toBe(160);
                  expect(g.children[0].height).toBe(60);
                  return [
                    2 /*return*/,
                    { children: [{ id: 'n3', x: 0, y: 0 }], edges: [] },
                  ];
                });
              });
            });
          graph = {
            nodes: [{ id: 'n3', label: 'C', type: 'Role' }],
            edges: [],
          };
          return [4 /*yield*/, elk_layout_1.layoutEngine.layoutGraph(graph)];
        case 1:
          _a.sent();
          spy.mockRestore();
          return [2 /*return*/];
      }
    });
  });
});
test('layoutGraph handles missing edge sections array', function () {
  return __awaiter(void 0, void 0, void 0, function () {
    var result;
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          jest
            .spyOn(elk_bundled_js_1.default.prototype, 'layout')
            .mockResolvedValue({ children: [], edges: undefined });
          return [
            4 /*yield*/,
            elk_layout_1.layoutEngine.layoutGraph({
              nodes: [],
              edges: [],
            }),
          ];
        case 1:
          result = _a.sent();
          expect(result.edges).toEqual([]);
          return [2 /*return*/];
      }
    });
  });
});
