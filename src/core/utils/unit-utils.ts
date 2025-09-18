/**
 * Convert between board units, millimetres and inches.
 *
 * Miro measures widget dimensions in board units. At 100% zoom
 * 1 board unit equals 1 device-independent pixel. In typical web
 * environments 96 pixels map to one inch, allowing a direct
 * conversion between board units and physical dimensions.
 */
export function boardUnitsToMm(units: number): number {
  return (units * 25.4) / 96
}

/** Convert board units to inches. */
export function boardUnitsToInches(units: number): number {
  return units / 96
}

/** Convert millimetres to board units. */
export function mmToBoardUnits(mm: number): number {
  return (mm * 96) / 25.4
}

/** Convert inches to board units. */
export function inchesToBoardUnits(inches: number): number {
  return inches * 96
}
