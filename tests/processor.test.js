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
var GraphProcessor_1 = require('../src/core/GraphProcessor');
var graph_1 = require('../src/core/graph');
var templates_1 = require('../src/templates');
var elk_layout_1 = require('../src/core/elk-layout');
var sample_graph_json_1 = require('../sample-graph.json');
describe('GraphProcessor', function () {
  var processor = new GraphProcessor_1.GraphProcessor();
  beforeEach(function () {
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
          set: jest.fn().mockResolvedValue({}),
          zoomTo: jest.fn(),
        },
        createConnector: jest.fn().mockResolvedValue({
          setMetadata: jest.fn(),
          getMetadata: jest.fn(),
          sync: jest.fn(),
          id: 'c1',
        }),
        createShape: jest.fn().mockResolvedValue({
          setMetadata: jest.fn(),
          getMetadata: jest.fn(),
          sync: jest.fn(),
          id: 's1',
          type: 'shape',
        }),
        createText: jest.fn().mockResolvedValue({
          setMetadata: jest.fn(),
          getMetadata: jest.fn(),
          sync: jest.fn(),
          id: 't1',
          type: 'text',
        }),
        createFrame: jest.fn().mockResolvedValue({
          add: jest.fn(),
          id: 'f1',
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
    graph_1.graphService.resetBoardCache();
    jest
      .spyOn(templates_1.templateManager, 'createFromTemplate')
      .mockResolvedValue({
        type: 'shape',
        setMetadata: jest.fn(),
        getMetadata: jest.fn(),
        getItems: jest.fn(),
        sync: jest.fn(),
        id: 's1',
      });
  });
  afterEach(function () {
    jest.restoreAllMocks();
    graph_1.graphService.resetBoardCache();
  });
  it('processGraph runs without throwing and syncs items', function () {
    return __awaiter(void 0, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              processor.processGraph(sample_graph_json_1.default),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  });
  it('delegates work to helper methods', function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var gp, frameSpy, nodeSpy, connectorSpy, simpleGraph;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            gp = new GraphProcessor_1.GraphProcessor();
            frameSpy = jest.spyOn(gp, 'createFrame');
            nodeSpy = jest.spyOn(gp, 'createNodes');
            connectorSpy = jest.spyOn(gp, 'createConnectorsAndZoom');
            jest
              .spyOn(elk_layout_1.layoutEngine, 'layoutGraph')
              .mockResolvedValue({
                nodes: { n1: { x: 0, y: 0, width: 10, height: 10 } },
                edges: [],
              });
            simpleGraph = {
              nodes: [{ id: 'n1', label: 'A', type: 'Role' }],
              edges: [],
            };
            return [4 /*yield*/, gp.processGraph(simpleGraph)];
          case 1:
            _a.sent();
            expect(frameSpy).toHaveBeenCalled();
            expect(nodeSpy).toHaveBeenCalled();
            expect(connectorSpy).toHaveBeenCalled();
            return [2 /*return*/];
        }
      });
    });
  });
  it('forwards layout options', function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var spy, simpleGraph;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            spy = jest
              .spyOn(elk_layout_1.layoutEngine, 'layoutGraph')
              .mockResolvedValue({ nodes: {}, edges: [] });
            simpleGraph = { nodes: [], edges: [] };
            return [
              4 /*yield*/,
              processor.processGraph(simpleGraph, {
                layout: { algorithm: 'force' },
              }),
            ];
          case 1:
            _a.sent();
            expect(spy).toHaveBeenCalledWith(simpleGraph, {
              algorithm: 'force',
            });
            return [2 /*return*/];
        }
      });
    });
  });
  it('throws on invalid graph', function () {
    return __awaiter(void 0, void 0, void 0, function () {
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [
              4 /*yield*/,
              expect(processor.processGraph({})).rejects.toThrow(
                'Invalid graph format',
              ),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  });
  it('positions frame at space center', function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var simpleGraph, createArgs, offset;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            simpleGraph = {
              nodes: [{ id: 'n1', label: 'A', type: 'Role' }],
              edges: [],
            };
            // Mock layout with a single node to make dimensions deterministic
            jest
              .spyOn(elk_layout_1.layoutEngine, 'layoutGraph')
              .mockResolvedValue({
                nodes: { n1: { x: 0, y: 0, width: 10, height: 10 } },
                edges: [],
              });
            return [4 /*yield*/, processor.processGraph(simpleGraph)];
          case 1:
            _a.sent();
            createArgs = global.miro.board.createFrame.mock.calls[0][0];
            expect(createArgs.width).toBe(210);
            expect(createArgs.height).toBe(210);
            expect(createArgs.x).toBe(0);
            expect(createArgs.y).toBe(0);
            offset = processor.calculateOffset(
              { x: 0, y: 0 },
              210,
              210,
              { minX: 0, minY: 0 },
              100,
            );
            expect(offset.offsetX).toBe(-5);
            expect(offset.offsetY).toBe(-5);
            expect(global.miro.board.viewport.zoomTo).toHaveBeenCalledWith(
              expect.objectContaining({ id: 'f1' }),
            );
            return [2 /*return*/];
        }
      });
    });
  });
  it('zooms to shapes when no frame created', function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var simpleGraph;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            simpleGraph = {
              nodes: [{ id: 'n1', label: 'A', type: 'Role' }],
              edges: [],
            };
            jest
              .spyOn(elk_layout_1.layoutEngine, 'layoutGraph')
              .mockResolvedValue({
                nodes: { n1: { x: 0, y: 0, width: 10, height: 10 } },
                edges: [],
              });
            return [
              4 /*yield*/,
              processor.processGraph(simpleGraph, { createFrame: false }),
            ];
          case 1:
            _a.sent();
            expect(global.miro.board.viewport.zoomTo).toHaveBeenCalledWith([
              expect.objectContaining({ id: 's1' }),
            ]);
            return [2 /*return*/];
        }
      });
    });
  });
  it('throws when edge source is missing', function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var graph;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            graph = {
              nodes: [{ id: 'n1', label: 'A', type: 'Role' }],
              edges: [{ from: 'n2', to: 'n1' }],
            };
            return [
              4 /*yield*/,
              expect(processor.processGraph(graph)).rejects.toThrow(
                'Edge references missing node: n2',
              ),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  });
  it('throws when edge target is missing', function () {
    return __awaiter(void 0, void 0, void 0, function () {
      var graph;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            graph = {
              nodes: [{ id: 'n1', label: 'A', type: 'Role' }],
              edges: [{ from: 'n1', to: 'n2' }],
            };
            return [
              4 /*yield*/,
              expect(processor.processGraph(graph)).rejects.toThrow(
                'Edge references missing node: n2',
              ),
            ];
          case 1:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  });
});
