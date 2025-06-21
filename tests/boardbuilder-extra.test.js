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
 * Additional edge case tests for the BoardBuilder class.
 */
describe('BoardBuilder additional cases', function () {
  afterEach(function () {
    jest.restoreAllMocks();
    delete global.miro;
  });
  test('findSpace throws when board not initialized', function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var builder;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            builder = new BoardBuilder_1.BoardBuilder();
            // Without a miro global the builder should reject
            return [
              4 /*yield*/,
              expect(builder.findSpace(1, 1)).rejects.toThrow(
                'Miro board not initialized',
              ),
            ];
          case 1:
            // Without a miro global the builder should reject
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  });
  test('setFrame and getFrame round trip', function () {
    var builder = new BoardBuilder_1.BoardBuilder();
    // Store a frame and ensure we get the same reference back
    var frame = { id: 'f' };
    builder.setFrame(frame);
    expect(builder.getFrame()).toBe(frame);
  });
  test('findNode validates parameters', function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var builder;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            builder = new BoardBuilder_1.BoardBuilder();
            // Non-string type should cause a validation error
            return [
              4 /*yield*/,
              expect(builder.findNode(1, 'a')).rejects.toThrow(
                'Invalid search parameters',
              ),
            ];
          case 1:
            // Non-string type should cause a validation error
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  });
  test('findConnector validates parameters', function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var builder;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            builder = new BoardBuilder_1.BoardBuilder();
            // Null id should trigger validation error
            return [
              4 /*yield*/,
              expect(builder.findConnector('a', null)).rejects.toThrow(
                'Invalid search parameters',
              ),
            ];
          case 1:
            // Null id should trigger validation error
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  });
  test('createNode throws on invalid arguments and missing template', function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var builder;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            builder = new BoardBuilder_1.BoardBuilder();
            // Guard against invalid parameters
            return [
              4 /*yield*/,
              expect(
                builder.createNode(null, { x: 0, y: 0, width: 1, height: 1 }),
              ).rejects.toThrow('Invalid node'),
            ];
          case 1:
            // Guard against invalid parameters
            _a.sent();
            return [
              4 /*yield*/,
              expect(builder.createNode({}, null)).rejects.toThrow(
                'Invalid position',
              ),
            ];
          case 2:
            _a.sent();
            // Unknown template results in an error
            jest
              .spyOn(templates_1.templateManager, 'getTemplate')
              .mockReturnValue(undefined);
            return [
              4 /*yield*/,
              expect(
                builder.createNode(
                  { id: 'x', label: 'L', type: 'unknown' },
                  {
                    x: 0,
                    y: 0,
                    width: 1,
                    height: 1,
                  },
                ),
              ).rejects.toThrow("Template 'unknown' not found"),
            ];
          case 3:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  });
  test('createNode creates group and sets metadata', function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var items, builder, node, pos, result;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            items = [{ setMetadata: jest.fn() }, { setMetadata: jest.fn() }];
            // Mock creation of a group containing two items
            jest
              .spyOn(templates_1.templateManager, 'createFromTemplate')
              .mockResolvedValue({
                type: 'group',
                getItems: jest.fn().mockResolvedValue(items),
              });
            jest
              .spyOn(templates_1.templateManager, 'getTemplate')
              .mockReturnValue({ elements: [{ shape: 'r' }, { text: 't' }] });
            builder = new BoardBuilder_1.BoardBuilder();
            // Ensure a fresh node is created rather than updated
            jest.spyOn(builder, 'findNode').mockResolvedValue(undefined);
            node = { id: 'n1', label: 'A', type: 'multi' };
            pos = { x: 0, y: 0, width: 1, height: 1 };
            return [4 /*yield*/, builder.createNode(node, pos)];
          case 1:
            result = _a.sent();
            expect(result.type).toBe('group');
            // Metadata should be written to child items
            expect(items[0].setMetadata).toHaveBeenCalled();
            return [2 /*return*/];
        }
      });
    });
  });
  test('updateExistingNode for group', function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var itemMocks, group, builder, node, pos, result;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            itemMocks = [
              { setMetadata: jest.fn(), type: 'shape' },
              { setMetadata: jest.fn(), type: 'text' },
            ];
            group = {
              type: 'group',
              getItems: jest.fn().mockResolvedValue(itemMocks),
            };
            builder = new BoardBuilder_1.BoardBuilder();
            // findNode returns an existing group for the node
            jest.spyOn(builder, 'findNode').mockResolvedValue(group);
            jest
              .spyOn(templates_1.templateManager, 'getTemplate')
              .mockReturnValue({ elements: [{ shape: 's' }, { text: 't' }] });
            node = { id: 'n', label: 'L', type: 'Role' };
            pos = { x: 0, y: 0, width: 1, height: 1 };
            return [4 /*yield*/, builder.createNode(node, pos)];
          case 1:
            result = _a.sent();
            // The existing group is returned and updated
            expect(result).toBe(group);
            expect(itemMocks[0].setMetadata).toHaveBeenCalled();
            return [2 /*return*/];
        }
      });
    });
  });
  test('createEdges validates inputs and syncs', function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var builder;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            builder = new BoardBuilder_1.BoardBuilder();
            // Invalid edges array
            return [
              4 /*yield*/,
              expect(builder.createEdges(null, {})).rejects.toThrow(
                'Invalid edges',
              ),
            ];
          case 1:
            // Invalid edges array
            _a.sent();
            // Invalid node map
            return [
              4 /*yield*/,
              expect(builder.createEdges([], null)).rejects.toThrow(
                'Invalid node map',
              ),
            ];
          case 2:
            // Invalid node map
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  });
  test('syncAll calls sync when available', function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var builder, item;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            builder = new BoardBuilder_1.BoardBuilder();
            item = { sync: jest.fn() };
            return [4 /*yield*/, builder.syncAll([item, {}])];
          case 1:
            _a.sent();
            expect(item.sync).toHaveBeenCalled();
            return [2 /*return*/];
        }
      });
    });
  });
});
