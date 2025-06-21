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
var CardProcessor_1 = require('../src/board/CardProcessor');
/** Additional branch coverage for CardProcessor */
describe('CardProcessor branches', function () {
  afterEach(function () {
    jest.restoreAllMocks();
    delete global.miro;
  });
  test('getBoardCards caches board fetches', function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var board, cp;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            board = { get: jest.fn().mockResolvedValue([]) };
            global.miro = { board: board };
            cp = new CardProcessor_1.CardProcessor();
            return [4 /*yield*/, cp.getBoardCards()];
          case 1:
            _a.sent();
            return [4 /*yield*/, cp.getBoardCards()];
          case 2:
            _a.sent();
            expect(board.get).toHaveBeenCalledTimes(1);
            return [2 /*return*/];
        }
      });
    });
  });
  test('loadCardMap ignores cards without id metadata', function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var card, cp, map;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            card = {
              getMetadata: jest.fn().mockResolvedValue({}),
              id: '1',
            };
            global.miro = {
              board: { get: jest.fn().mockResolvedValue([card]) },
            };
            cp = new CardProcessor_1.CardProcessor();
            return [4 /*yield*/, cp.loadCardMap()];
          case 1:
            map = _a.sent();
            expect(map.size).toBe(0);
            return [2 /*return*/];
        }
      });
    });
  });
  test('ensureTagIds skips tag with no id', function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var cp, tagMap, ids;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            cp = new CardProcessor_1.CardProcessor();
            global.miro = { board: { createTag: jest.fn() } };
            tagMap = new Map([['x', { title: 'x' }]]);
            return [4 /*yield*/, cp.ensureTagIds(['x'], tagMap)];
          case 1:
            ids = _a.sent();
            expect(ids).toEqual([]);
            return [2 /*return*/];
        }
      });
    });
  });
  test('updateCardWidget leaves taskStatus when undefined', function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var cp, card;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            cp = new CardProcessor_1.CardProcessor();
            cp.ensureTagIds = jest.fn().mockResolvedValue([]);
            card = {
              taskStatus: 'old',
              setMetadata: jest.fn(),
            };
            return [
              4 /*yield*/,
              cp.updateCardWidget(card, { id: '1', title: 't' }, new Map()),
            ];
          case 1:
            _a.sent();
            expect(card.taskStatus).toBe('old');
            expect(card.setMetadata).toHaveBeenCalledWith('app.miro.cards', {
              id: '1',
            });
            return [2 /*return*/];
        }
      });
    });
  });
});
