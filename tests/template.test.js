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
var templates_1 = require('../src/templates');
describe('createFromTemplate', function () {
  beforeEach(function () {
    global.miro = {
      board: {
        createShape: jest.fn().mockResolvedValue({
          type: 'shape',
          setMetadata: jest.fn(),
          getMetadata: jest.fn(),
          sync: jest.fn(),
          id: 's1',
        }),
        createText: jest.fn().mockResolvedValue({
          type: 'text',
          setMetadata: jest.fn(),
          getMetadata: jest.fn(),
          sync: jest.fn(),
          id: 't1',
        }),
        group: jest.fn().mockResolvedValue({
          type: 'group',
          getItems: jest.fn().mockResolvedValue([]),
          setMetadata: jest.fn(),
          sync: jest.fn(),
          id: 'g1',
        }),
      },
    };
  });
  afterEach(function () {
    jest.restoreAllMocks();
  });
  test('creates a single shape with correct style', function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var widget, args;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              templates_1.templateManager.createFromTemplate(
                'Role',
                'Label',
                0,
                0,
              ),
            ];
          case 1:
            widget = _a.sent();
            expect(widget.type).toBe('shape');
            args = global.miro.board.createShape.mock.calls[0][0];
            expect(args.shape).toBe('round_rectangle');
            expect(args.style.fillColor).toBe('#FDE9D9');
            expect(global.miro.board.group).not.toHaveBeenCalled();
            return [2 /*return*/];
        }
      });
    });
  });
  test('groups multiple elements', function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var widget, items;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            templates_1.templateManager.templates.multi = {
              elements: [
                { shape: 'rectangle', width: 50, height: 50 },
                { text: 'test' },
              ],
            };
            return [
              4 /*yield*/,
              templates_1.templateManager.createFromTemplate(
                'multi',
                'Label',
                0,
                0,
              ),
            ];
          case 1:
            widget = _a.sent();
            expect(widget.type).toBe('group');
            expect(global.miro.board.createShape).toHaveBeenCalled();
            expect(global.miro.board.createText).toHaveBeenCalled();
            items = global.miro.board.group.mock.calls[0][0].items;
            expect(items).toHaveLength(2);
            return [2 /*return*/];
        }
      });
    });
  });
  test('creates text only widget', function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var widget;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            templates_1.templateManager.templates.textOnly = {
              elements: [{ text: 'T' }],
            };
            return [
              4 /*yield*/,
              templates_1.templateManager.createFromTemplate(
                'textOnly',
                'Label',
                0,
                0,
              ),
            ];
          case 1:
            widget = _a.sent();
            expect(widget.type).toBe('text');
            return [2 /*return*/];
        }
      });
    });
  });
  test('apply fill property when style lacks fillColor', function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var widget, args;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            templates_1.templateManager.templates.fillStyle = {
              elements: [{ shape: 'rect', fill: '#fff', style: {} }],
            };
            return [
              4 /*yield*/,
              templates_1.templateManager.createFromTemplate(
                'fillStyle',
                'L',
                0,
                0,
              ),
            ];
          case 1:
            widget = _a.sent();
            args = global.miro.board.createShape.mock.calls.pop()[0];
            expect(args.style.fillColor).toBe('#fff');
            expect(widget.type).toBe('shape');
            return [2 /*return*/];
        }
      });
    });
  });
  test('throws when template missing', function () {
    return __awaiter(void 0, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              expect(
                templates_1.templateManager.createFromTemplate(
                  'missing',
                  'L',
                  0,
                  0,
                ),
              ).rejects.toThrow("Template 'missing' not found"),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  });
});
