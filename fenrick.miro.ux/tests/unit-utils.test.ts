import {
  boardUnitsToMm,
  boardUnitsToInches,
  mmToBoardUnits,
  inchesToBoardUnits,
} from '../src/core/utils/unit-utils';

describe('unit-utils', () => {
  test('boardUnitsToMm converts units', () => {
    expect(boardUnitsToMm(96)).toBeCloseTo(25.4);
  });

  test('boardUnitsToInches converts units', () => {
    expect(boardUnitsToInches(192)).toBeCloseTo(2);
  });

  test('mmToBoardUnits converts units', () => {
    expect(mmToBoardUnits(25.4)).toBeCloseTo(96);
  });

  test('inchesToBoardUnits converts units', () => {
    expect(inchesToBoardUnits(2)).toBeCloseTo(192);
  });
});
