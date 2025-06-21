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
var BoardBuilder_1 = require('../src/board/BoardBuilder');
var templates_1 = require('../src/templates');
/**
 * Unit tests targeting rarely hit branches within BoardBuilder
 * to increase overall coverage.
 */
describe('BoardBuilder branch coverage', function () {
  afterEach(function () {
    jest.restoreAllMocks();
    delete global.miro;
  });
  test('findNode searches groups', function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var item, group, builder, result;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            item = {
              getMetadata: jest
                .fn()
                .mockResolvedValue({ type: 'Role', label: 'A' }),
            };
            group = { getItems: jest.fn().mockResolvedValue([item]) };
            // `board.get` first returns no shapes then a single group
            global.miro = {
              board: {
                get: jest
                  .fn()
                  .mockResolvedValueOnce([])
                  .mockResolvedValueOnce([group]),
              },
            };
            builder = new BoardBuilder_1.BoardBuilder();
            return [4 /*yield*/, builder.findNode('Role', 'A')];
          case 1:
            result = _a.sent();
            expect(result).toBe(group);
            return [2 /*return*/];
        }
      });
    });
  });
  test('createNode applies fill color when style missing', function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var builder, el, shape;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            builder = new BoardBuilder_1.BoardBuilder();
            el = { shape: 'rect', fill: '#fff', width: 10, height: 10 };
            shape = { type: 'shape', style: {}, setMetadata: jest.fn() };
            // Pretend the node does not already exist
            jest.spyOn(builder, 'findNode').mockResolvedValue(undefined);
            // Template lookup returns our element
            jest
              .spyOn(templates_1.templateManager, 'getTemplate')
              .mockReturnValue({ elements: [el] });
            // createFromTemplate applies the element to the new shape
            jest
              .spyOn(templates_1.templateManager, 'createFromTemplate')
              .mockImplementation(function () {
                return __awaiter(void 0, void 0, void 0, function () {
                  return __generator(this, function (_a) {
                    builder.applyShapeElement(shape, el, 'L');
                    return [2 /*return*/, shape];
                  });
                });
              });
            return [
              4 /*yield*/,
              builder.createNode(
                { id: 'n', label: 'L', type: 'fill' },
                {
                  x: 0,
                  y: 0,
                  width: 1,
                  height: 1,
                },
              ),
            ];
          case 1:
            _a.sent();
            // The fill color from the element should be applied
            expect(shape.style.fillColor).toBe('#fff');
            return [2 /*return*/];
        }
      });
    });
  });
  test('applyTextElement merges style when provided', function () {
    var builder = new BoardBuilder_1.BoardBuilder();
    var item = { type: 'text', style: { fontSize: 10 } };
    var el = { text: 'T', style: { color: 'red' } };
    // Applying a text element should merge the style properties
    builder.applyTextElement(item, el, 'L');
    expect(item.style.color).toBe('red');
    expect(item.style.fontSize).toBe(10);
  });
  test('createEdges skips edges with missing nodes', function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var builder, edges, result;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            global.miro = {
              board: {
                get: jest.fn().mockResolvedValue([]),
                createConnector: jest.fn().mockResolvedValue({
                  setMetadata: jest.fn(),
                  getMetadata: jest.fn(),
                  sync: jest.fn(),
                  id: 'c1',
                }),
              },
            };
            builder = new BoardBuilder_1.BoardBuilder();
            edges = [{ from: 'n1', to: 'n2' }];
            return [4 /*yield*/, builder.createEdges(edges, { n1: {} })];
          case 1:
            result = _a.sent();
            expect(result).toEqual([]);
            return [2 /*return*/];
        }
      });
    });
  });
  test('searchGroups ignores non-array item lists', function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var group, builder, result;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            group = { getItems: jest.fn().mockResolvedValue(null) };
            global.miro = {
              board: { get: jest.fn().mockResolvedValue([group]) },
            };
            builder = new BoardBuilder_1.BoardBuilder();
            return [4 /*yield*/, builder.searchGroups('Role', 'A')];
          case 1:
            result = _a.sent();
            expect(result).toBeUndefined();
            return [2 /*return*/];
        }
      });
    });
  });
  test('updateConnector handles missing template and hints', function () {
    var connector = { style: {}, shape: 'curved' };
    var builder = new BoardBuilder_1.BoardBuilder();
    builder.updateConnector(
      connector,
      { from: 'a', to: 'b' },
      undefined,
      undefined,
    );
    expect(connector.shape).toBe('curved');
    expect(connector.style).toEqual({});
  });
  test('searchShapes falls back to empty cache', function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var builder, result;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            builder = new BoardBuilder_1.BoardBuilder();
            jest.spyOn(builder, 'loadShapeCache').mockResolvedValue(undefined);
            return [4 /*yield*/, builder.searchShapes('Role', 'A')];
          case 1:
            result = _a.sent();
            expect(result).toBeUndefined();
            return [2 /*return*/];
        }
      });
    });
  });
  test('applyShapeElement preserves existing fillColor', function () {
    var builder = new BoardBuilder_1.BoardBuilder();
    var item = { type: 'shape', style: { fillColor: '#abc' } };
    var el = { shape: 'rect', fill: '#fff', width: 1, height: 1 };
    builder.applyShapeElement(item, el, 'L');
    expect(item.style.fillColor).toBe('#abc');
  });
  test('applyElementToItem handles text widgets', function () {
    var builder = new BoardBuilder_1.BoardBuilder();
    var item = { type: 'text', style: {} };
    var el = { text: 'Name' };
    builder.applyElementToItem(item, el, 'Label');
    expect(item.content).toBe('Name');
  });
  test('updateConnector applies hint positions', function () {
    var builder = new BoardBuilder_1.BoardBuilder();
    var connector = { style: {}, shape: 'curved' };
    builder.updateConnector(
      connector,
      { from: 'a', to: 'b', label: 'L' },
      { shape: 'elbowed', style: { strokeStyle: 'dotted' } },
      { startPosition: { x: 0, y: 0 }, endPosition: { x: 1, y: 1 } },
    );
    expect(connector.start.position).toEqual({ x: 0, y: 0 });
    expect(connector.end.position).toEqual({ x: 1, y: 1 });
    expect(connector.style.strokeStyle).toBe('dotted');
  });
  test('createConnector without label sets no caption', function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var board, builder, edge, result, args;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            board = {
              createConnector: jest
                .fn()
                .mockResolvedValue({ setMetadata: jest.fn() }),
            };
            global.miro = { board: board };
            builder = new BoardBuilder_1.BoardBuilder();
            edge = { from: 'n1', to: 'n2' };
            return [
              4 /*yield*/,
              builder.createConnector(
                edge,
                { id: 'a' },
                { id: 'b' },
                undefined,
                undefined,
              ),
            ];
          case 1:
            result = _a.sent();
            args = board.createConnector.mock.calls[0][0];
            expect(args.captions).toBeUndefined();
            expect(result).toBeDefined();
            return [2 /*return*/];
        }
      });
    });
  });
});
