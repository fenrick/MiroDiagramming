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
/** @jest-environment jsdom */
var react_1 = require('react');
var react_2 = require('@testing-library/react');
require('@testing-library/jest-dom');
var app_1 = require('../src/app');
var GraphProcessor_1 = require('../src/core/GraphProcessor');
var CardProcessor_1 = require('../src/board/CardProcessor');
describe('App UI integration', function () {
  beforeEach(function () {
    global.miro = {
      board: {
        notifications: { showError: jest.fn().mockResolvedValue(undefined) },
      },
    };
  });
  afterEach(function () {
    jest.restoreAllMocks();
    delete global.miro;
  });
  function selectFile() {
    var file = new File(['{}'], 'graph.json', { type: 'application/json' });
    var input = react_2.screen.getByTestId('file-input');
    react_2.fireEvent.change(input, { target: { files: [file] } });
    return file;
  }
  test('renders and processes diagram file', function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var spy, button;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            spy = jest
              .spyOn(GraphProcessor_1.GraphProcessor.prototype, 'processFile')
              .mockResolvedValue(undefined);
            (0, react_2.render)(react_1.default.createElement(app_1.App));
            return [
              4 /*yield*/,
              (0, react_2.act)(function () {
                return __awaiter(void 0, void 0, void 0, function () {
                  return __generator(this, function (_a) {
                    selectFile();
                    return [2 /*return*/];
                  });
                });
              }),
            ];
          case 1:
            _a.sent();
            button = react_2.screen.getByRole('button', {
              name: /create diagram/i,
            });
            return [
              4 /*yield*/,
              (0, react_2.act)(function () {
                return __awaiter(void 0, void 0, void 0, function () {
                  return __generator(this, function (_a) {
                    react_2.fireEvent.click(button);
                    return [2 /*return*/];
                  });
                });
              }),
            ];
          case 2:
            _a.sent();
            expect(spy).toHaveBeenCalledWith(
              expect.any(File),
              expect.objectContaining({ layout: expect.any(Object) }),
            );
            return [2 /*return*/];
        }
      });
    });
  });
  test('toggles to cards mode and processes', function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var spy, button;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            spy = jest
              .spyOn(CardProcessor_1.CardProcessor.prototype, 'processFile')
              .mockResolvedValue(undefined);
            (0, react_2.render)(react_1.default.createElement(app_1.App));
            react_2.fireEvent.click(react_2.screen.getByLabelText(/cards/i));
            return [
              4 /*yield*/,
              (0, react_2.act)(function () {
                return __awaiter(void 0, void 0, void 0, function () {
                  return __generator(this, function (_a) {
                    selectFile();
                    return [2 /*return*/];
                  });
                });
              }),
            ];
          case 1:
            _a.sent();
            button = react_2.screen.getByRole('button', {
              name: /create cards/i,
            });
            return [
              4 /*yield*/,
              (0, react_2.act)(function () {
                return __awaiter(void 0, void 0, void 0, function () {
                  return __generator(this, function (_a) {
                    react_2.fireEvent.click(button);
                    return [2 /*return*/];
                  });
                });
              }),
            ];
          case 2:
            _a.sent();
            expect(spy).toHaveBeenCalled();
            return [2 /*return*/];
        }
      });
    });
  });
  test('mode radio buttons change description text', function () {
    (0, react_2.render)(react_1.default.createElement(app_1.App));
    react_2.fireEvent.click(react_2.screen.getByLabelText(/cards/i));
    expect(
      react_2.screen.getByText(
        /select the json file to import a list of cards/i,
      ),
    ).toBeInTheDocument();
    react_2.fireEvent.click(react_2.screen.getByLabelText(/diagram/i));
    expect(
      react_2.screen.getByText(/select the json file to import a diagram/i),
    ).toBeInTheDocument();
  });
  test('dropzone has accessibility attributes', function () {
    (0, react_2.render)(react_1.default.createElement(app_1.App));
    var zone = react_2.screen.getByLabelText(/file drop area/i);
    expect(zone).toHaveAttribute('aria-describedby', 'dropzone-instructions');
    var input = react_2.screen.getByLabelText(/json file input/i);
    expect(input).toBeInTheDocument();
  });
  test('shows error notification', function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var error, spy, button;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            error = new Error('fail');
            jest.spyOn(console, 'error').mockImplementation(function () {});
            spy = jest
              .spyOn(GraphProcessor_1.GraphProcessor.prototype, 'processFile')
              .mockRejectedValue(error);
            (0, react_2.render)(react_1.default.createElement(app_1.App));
            return [
              4 /*yield*/,
              (0, react_2.act)(function () {
                return __awaiter(void 0, void 0, void 0, function () {
                  return __generator(this, function (_a) {
                    selectFile();
                    return [2 /*return*/];
                  });
                });
              }),
            ];
          case 1:
            _a.sent();
            button = react_2.screen.getByRole('button', {
              name: /create diagram/i,
            });
            return [
              4 /*yield*/,
              (0, react_2.act)(function () {
                return __awaiter(void 0, void 0, void 0, function () {
                  return __generator(this, function (_a) {
                    react_2.fireEvent.click(button);
                    return [2 /*return*/];
                  });
                });
              }),
            ];
          case 2:
            _a.sent();
            expect(spy).toHaveBeenCalled();
            expect(
              global.miro.board.notifications.showError,
            ).toHaveBeenCalledWith('Error: fail');
            return [2 /*return*/];
        }
      });
    });
  });
  test('withFrame option forwards frame title', function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var spy, button;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            spy = jest
              .spyOn(GraphProcessor_1.GraphProcessor.prototype, 'processFile')
              .mockResolvedValue(undefined);
            (0, react_2.render)(react_1.default.createElement(app_1.App));
            return [
              4 /*yield*/,
              (0, react_2.act)(function () {
                return __awaiter(void 0, void 0, void 0, function () {
                  return __generator(this, function (_a) {
                    selectFile();
                    return [2 /*return*/];
                  });
                });
              }),
            ];
          case 1:
            _a.sent();
            react_2.fireEvent.click(
              react_2.screen.getByLabelText(/wrap items in frame/i),
            );
            react_2.fireEvent.change(
              react_2.screen.getByPlaceholderText(/frame title/i),
              {
                target: { value: 'Frame A' },
              },
            );
            button = react_2.screen.getByRole('button', {
              name: /create diagram/i,
            });
            return [
              4 /*yield*/,
              (0, react_2.act)(function () {
                return __awaiter(void 0, void 0, void 0, function () {
                  return __generator(this, function (_a) {
                    react_2.fireEvent.click(button);
                    return [2 /*return*/];
                  });
                });
              }),
            ];
          case 2:
            _a.sent();
            expect(spy).toHaveBeenCalledWith(
              expect.any(File),
              expect.objectContaining({
                createFrame: true,
                frameTitle: 'Frame A',
                layout: expect.any(Object),
              }),
            );
            return [2 /*return*/];
        }
      });
    });
  });
  test('undoLastImport helper calls undo and clears state', function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var proc, cleared;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            proc = { undoLast: jest.fn().mockResolvedValue(undefined) };
            cleared = false;
            return [
              4 /*yield*/,
              (0, app_1.undoLastImport)(proc, function () {
                cleared = true;
              }),
            ];
          case 1:
            _a.sent();
            expect(proc.undoLast).toHaveBeenCalled();
            expect(cleared).toBe(true);
            return [2 /*return*/];
        }
      });
    });
  });
  test('getDropzoneStyle computes colours', function () {
    var base = (0, app_1.getDropzoneStyle)(false, false);
    expect(base.borderColor).toBe('rgba(41, 128, 185, 0.5)');
    var accept = (0, app_1.getDropzoneStyle)(true, false);
    expect(accept.borderColor).toBe('rgba(41, 128, 185, 1.0)');
    var reject = (0, app_1.getDropzoneStyle)(false, true);
    expect(reject.borderColor).toBe('rgba(192, 57, 43,1.0)');
  });
});
