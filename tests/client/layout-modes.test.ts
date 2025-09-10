import { isNestedAlgorithm, NESTED_ALGORITHMS } from '../src/core/graph/layout-modes'

describe('layout-modes', () => {
  test('NESTED_ALGORITHMS lists supported algorithms', () =>
    expect(NESTED_ALGORITHMS).toEqual(['box', 'rectstacking']))

  test('isNestedAlgorithm validates algorithm names', () => {
    expect(isNestedAlgorithm('box')).toBe(true)
    expect(isNestedAlgorithm('rectstacking')).toBe(true)
    expect(isNestedAlgorithm('force')).toBe(false)
    expect(isNestedAlgorithm(null)).toBe(false)
  })
})
