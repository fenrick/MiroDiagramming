import { describe, it, expect } from 'vitest'
import {
  boardUnitsToMm,
  boardUnitsToInches,
  mmToBoardUnits,
  inchesToBoardUnits,
} from '../../src/core/utils/unit-utils'

describe('unit-utils', () => {
  it('converts board units to mm and inches', () => {
    expect(boardUnitsToMm(100)).toBeCloseTo(100 * 3.2, 5)
    expect(boardUnitsToInches(100)).toBeCloseTo((100 * 3.2) / 25.4, 5)
  })
  it('converts inverse units approximately', () => {
    const mm = 123
    const bu = mmToBoardUnits(mm)
    expect(boardUnitsToMm(bu)).toBeCloseTo(mm, 5)
    const inches = 4.5
    const bu2 = inchesToBoardUnits(inches)
    expect(boardUnitsToInches(bu2)).toBeCloseTo(inches, 5)
  })
})
