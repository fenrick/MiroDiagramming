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
var CardProcessor_1 = require('../src/CardProcessor');
var cardModule = require('../src/cards');
describe('CardProcessor', function () {
  var processor;
  beforeEach(function () {
    processor = new CardProcessor_1.CardProcessor();
    global.miro = {
      board: {
        get: jest.fn().mockResolvedValue([]),
        findEmptySpace: jest.fn().mockResolvedValue({
          x: 0,
          y: 0,
          width: 100,
          height: 100,
        }),
        viewport: {
          get: jest.fn().mockResolvedValue({
            x: 0,
            y: 0,
            width: 1000,
            height: 1000,
          }),
          zoomTo: jest.fn(),
        },
        createCard: jest.fn().mockResolvedValue({
          sync: jest.fn(),
          id: 'c1',
          setMetadata: jest.fn(),
        }),
        createTag: jest.fn().mockResolvedValue({ id: 't1' }),
        createFrame: jest.fn().mockResolvedValue({ add: jest.fn(), id: 'f1' }),
      },
    };
  });
  afterEach(function () {
    jest.restoreAllMocks();
    delete global.miro;
  });
  test('processFile loads and processes', function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var spy;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            jest
              .spyOn(cardModule.cardLoader, 'loadCards')
              .mockResolvedValue([{ title: 't' }]);
            spy = jest
              .spyOn(processor, 'processCards')
              .mockResolvedValue(undefined);
            return [4 /*yield*/, processor.processFile({ name: 'cards.json' })];
          case 1:
            _a.sent();
            expect(cardModule.cardLoader.loadCards).toHaveBeenCalled();
            expect(spy).toHaveBeenCalledWith([{ title: 't' }], {});
            return [2 /*return*/];
        }
      });
    });
  });
  test('processCards creates cards', function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var args;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              processor.processCards([
                {
                  title: 'A',
                  tags: [],
                  taskStatus: 'done',
                  style: { cardTheme: '#fff', fillBackground: true },
                  fields: [{ value: 'v' }],
                },
              ]),
            ];
          case 1:
            _a.sent();
            expect(global.miro.board.createCard).toHaveBeenCalled();
            args = global.miro.board.createCard.mock.calls[0][0];
            expect(args.taskStatus).toBe('done');
            expect(args.style).toEqual({
              cardTheme: '#fff',
              fillBackground: true,
            });
            expect(args.fields).toEqual([{ value: 'v' }]);
            expect(global.miro.board.viewport.zoomTo).toHaveBeenCalled();
            return [2 /*return*/];
        }
      });
    });
  });
  test('sets identifier metadata when creating', function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var card;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              processor.processCards([{ id: 'x', title: 'A' }]),
            ];
          case 1:
            _a.sent();
            return [
              4 /*yield*/,
              global.miro.board.createCard.mock.results[0].value,
            ];
          case 2:
            card = _a.sent();
            expect(card.setMetadata).toHaveBeenCalledWith('app.miro.cards', {
              id: 'x',
            });
            return [2 /*return*/];
        }
      });
    });
  });
  test('maps tag names to ids', function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var args;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            global.miro.board.get.mockImplementation(function (_a) {
              return __awaiter(void 0, [_a], void 0, function (_b) {
                var type = _b.type;
                return __generator(this, function (_c) {
                  if (type === 'tag')
                    return [2 /*return*/, [{ id: '1', title: 'alpha' }]];
                  return [2 /*return*/, []];
                });
              });
            });
            return [
              4 /*yield*/,
              processor.processCards([{ title: 'A', tags: ['alpha'] }]),
            ];
          case 1:
            _a.sent();
            args = global.miro.board.createCard.mock.calls[0][0];
            expect(args.tagIds).toEqual(['1']);
            return [2 /*return*/];
        }
      });
    });
  });
  test('creates missing tags', function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var args;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              processor.processCards([{ title: 'A', tags: ['beta'] }]),
            ];
          case 1:
            _a.sent();
            expect(global.miro.board.createTag).toHaveBeenCalledWith({
              title: 'beta',
            });
            args = global.miro.board.createCard.mock.calls[0][0];
            expect(args.tagIds).toEqual(['t1']);
            return [2 /*return*/];
        }
      });
    });
  });
  test('updates card when id matches', function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var existing;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            existing = {
              id: 'c2',
              title: 'old',
              fields: [],
              taskStatus: 'to-do',
              getMetadata: jest.fn().mockResolvedValue({ id: 'match' }),
              setMetadata: jest.fn(),
              sync: jest.fn(),
            };
            global.miro.board.get.mockImplementation(function (_a) {
              return __awaiter(void 0, [_a], void 0, function (_b) {
                var type = _b.type;
                return __generator(this, function (_c) {
                  if (type === 'tag') return [2 /*return*/, []];
                  if (type === 'card') return [2 /*return*/, [existing]];
                  return [2 /*return*/, []];
                });
              });
            });
            return [
              4 /*yield*/,
              processor.processCards([
                {
                  id: 'match',
                  title: 'new',
                  fields: [{ value: 'z' }],
                  style: { cardTheme: '#000', fillBackground: true },
                  taskStatus: 'in-progress',
                },
              ]),
            ];
          case 1:
            _a.sent();
            expect(global.miro.board.createCard).not.toHaveBeenCalled();
            expect(existing.title).toBe('new');
            expect(existing.fields).toEqual([{ value: 'z' }]);
            expect(existing.style).toEqual({
              cardTheme: '#000',
              fillBackground: true,
            });
            expect(existing.taskStatus).toBe('in-progress');
            expect(existing.setMetadata).toHaveBeenCalledWith(
              'app.miro.cards',
              {
                id: 'match',
              },
            );
            return [2 /*return*/];
        }
      });
    });
  });
  test('loads card metadata only once', function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var existing;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            existing = {
              id: 'c1',
              title: 'old',
              getMetadata: jest.fn().mockResolvedValue({ id: 'exists' }),
              setMetadata: jest.fn(),
              sync: jest.fn(),
            };
            global.miro.board.get.mockImplementation(function (_a) {
              return __awaiter(void 0, [_a], void 0, function (_b) {
                var type = _b.type;
                return __generator(this, function (_c) {
                  if (type === 'tag') return [2 /*return*/, []];
                  if (type === 'card') return [2 /*return*/, [existing]];
                  return [2 /*return*/, []];
                });
              });
            });
            return [
              4 /*yield*/,
              processor.processCards([
                { id: 'a', title: 'A' },
                { id: 'b', title: 'B' },
              ]),
            ];
          case 1:
            _a.sent();
            expect(existing.getMetadata).toHaveBeenCalledTimes(1);
            return [2 /*return*/];
        }
      });
    });
  });
  test('skips frame creation when disabled', function () {
    return __awaiter(void 0, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              processor.processCards([{ title: 'A' }], { createFrame: false }),
            ];
          case 1:
            _a.sent();
            expect(global.miro.board.createFrame).not.toHaveBeenCalled();
            expect(global.miro.board.viewport.zoomTo).toHaveBeenCalled();
            return [2 /*return*/];
        }
      });
    });
  });
  test('positions cards in rows', function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var calls;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              processor.processCards(
                [
                  { title: 'A' },
                  { title: 'B' },
                  { title: 'C' },
                  { title: 'D' },
                ],
                { columns: 2 },
              ),
            ];
          case 1:
            _a.sent();
            calls = global.miro.board.createCard.mock.calls;
            expect(calls[0][0]).toEqual(
              expect.objectContaining({ x: -160, y: -44 }),
            );
            expect(calls[1][0]).toEqual(
              expect.objectContaining({ x: 160, y: -44 }),
            );
            expect(calls[2][0]).toEqual(
              expect.objectContaining({ x: -160, y: 44 }),
            );
            expect(calls[3][0]).toEqual(
              expect.objectContaining({ x: 160, y: 44 }),
            );
            return [2 /*return*/];
        }
      });
    });
  });
  test('throws on invalid input', function () {
    return __awaiter(void 0, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              expect(processor.processCards(null)).rejects.toThrow(
                'Invalid cards',
              ),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  });
  test('no cards results in no action', function () {
    return __awaiter(void 0, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, processor.processCards([])];
          case 1:
            _a.sent();
            expect(global.miro.board.createCard).not.toHaveBeenCalled();
            expect(global.miro.board.createFrame).not.toHaveBeenCalled();
            expect(global.miro.board.viewport.zoomTo).not.toHaveBeenCalled();
            return [2 /*return*/];
        }
      });
    });
  });
  test('loadCardMap caches board lookups', function () {
    return __awaiter(void 0, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, processor.loadCardMap()];
          case 1:
            _a.sent();
            return [4 /*yield*/, processor.loadCardMap()];
          case 2:
            _a.sent();
            expect(global.miro.board.get).toHaveBeenCalledTimes(1);
            return [2 /*return*/];
        }
      });
    });
  });
  test('computeStartCoordinate derives correct origin', function () {
    var margin = CardProcessor_1.CardProcessor.CARD_MARGIN;
    var result = processor.computeStartCoordinate(200, 400, 100);
    expect(result).toBe(200 - 400 / 2 + margin + 100 / 2);
  });
  test('maybeCreateFrame creates frame when enabled', function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var builder, p, dims, frame;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            builder = {
              createFrame: jest.fn().mockResolvedValue({ id: 'f' }),
              setFrame: jest.fn(),
            };
            p = new CardProcessor_1.CardProcessor(builder);
            dims = { width: 10, height: 20, spot: { x: 1, y: 2 } };
            return [4 /*yield*/, p.maybeCreateFrame(true, dims, 't')];
          case 1:
            frame = _a.sent();
            expect(builder.createFrame).toHaveBeenCalledWith(10, 20, 1, 2, 't');
            expect(frame).toEqual({ id: 'f' });
            return [2 /*return*/];
        }
      });
    });
  });
  test('maybeCreateFrame skips frame when disabled', function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var builder, p, dims, frame;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            builder = {
              createFrame: jest.fn(),
              setFrame: jest.fn(),
            };
            p = new CardProcessor_1.CardProcessor(builder);
            dims = { width: 5, height: 5, spot: { x: 0, y: 0 } };
            return [4 /*yield*/, p.maybeCreateFrame(false, dims)];
          case 1:
            frame = _a.sent();
            expect(frame).toBeUndefined();
            expect(builder.createFrame).not.toHaveBeenCalled();
            expect(builder.setFrame).toHaveBeenCalledWith(undefined);
            return [2 /*return*/];
        }
      });
    });
  });
});
