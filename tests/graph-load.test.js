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
var graph_1 = require('../src/graph');
/**
 * Tests for the loadGraph helper which parses an uploaded file
 * and resets builder state.
 */
describe('loadGraph', function () {
  afterEach(function () {
    jest.restoreAllMocks();
    delete global.FileReader;
  });
  test('parses valid file and resets cache', function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var resetSpy, FR, file, data;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            resetSpy = jest.spyOn(graph_1.defaultBuilder, 'reset');
            FR = /** @class */ (function () {
              // Minimal FileReader mock that returns valid graph JSON
              function FR() {
                this.onload = null;
                this.onerror = null;
              }
              FR.prototype.readAsText = function () {
                this.onload &&
                  this.onload({
                    target: { result: '{"nodes":[],"edges":[]}' },
                  });
              };
              return FR;
            })();
            global.FileReader = FR;
            file = { name: 'graph.json' };
            return [4 /*yield*/, graph_1.graphService.loadGraph(file)];
          case 1:
            data = _a.sent();
            // Parsed graph should be returned and builder reset
            expect(data).toEqual({ nodes: [], edges: [] });
            expect(resetSpy).toHaveBeenCalled();
            return [2 /*return*/];
        }
      });
    });
  });
  test('throws on invalid file object', function () {
    return __awaiter(void 0, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            // Passing a null file should throw a validation error
            return [
              4 /*yield*/,
              expect(graph_1.graphService.loadGraph(null)).rejects.toThrow(
                'Invalid file',
              ),
            ];
          case 1:
            // Passing a null file should throw a validation error
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  });
  test('throws on invalid graph data', function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var FR;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            FR = /** @class */ (function () {
              // FileReader returns non-object JSON which should fail
              function FR() {
                this.onload = null;
              }
              FR.prototype.readAsText = function () {
                this.onload && this.onload({ target: { result: '[]' } });
              };
              return FR;
            })();
            global.FileReader = FR;
            return [
              4 /*yield*/,
              expect(
                graph_1.graphService.loadGraph({ name: 'a.json' }),
              ).rejects.toThrow('Invalid graph data'),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  });
  test('rejects when FileReader has no target', function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var FR;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            FR = /** @class */ (function () {
              // Simulate missing target in FileReader event
              function FR() {
                this.onload = null;
              }
              FR.prototype.readAsText = function () {
                this.onload && this.onload({ target: null });
              };
              return FR;
            })();
            global.FileReader = FR;
            return [
              4 /*yield*/,
              expect(
                graph_1.graphService.loadGraph({ name: 'bad.json' }),
              ).rejects.toBe('Failed to load file'),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  });
});
