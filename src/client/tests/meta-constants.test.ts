import { STRUCT_GRAPH_KEY } from '../src/board/meta-constants';

describe('meta-constants', () =>
  test('STRUCT_GRAPH_KEY has expected value', () =>
    expect(STRUCT_GRAPH_KEY).toBe('app.miro.structgraph')));
