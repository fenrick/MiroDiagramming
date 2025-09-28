import { describe, it, expect } from 'vitest'
import {
  boardUnitsToMm,
  boardUnitsToInches,
  mmToBoardUnits,
  inchesToBoardUnits,
} from '../../src/core/utils/unit-utilities'

describe('unit-utils', () => {
  it('converts board units to mm and inches', () => {
    // 96 board units == 1 inch == 25.4 mm
    expect(boardUnitsToMm(96)).toBeCloseTo(25.4, 5)
    expect(boardUnitsToInches(192)).toBeCloseTo(2, 5)
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
