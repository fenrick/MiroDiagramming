/**
 * Coordinates for a laid out card.
 */
export interface CardPosition {
  x: number;
  y: number;
}

/**
 * Layout options controlling the number of columns or the maximum width
 * available for a row of cards. Either `columns` or `maxWidth` may be
 * provided. The card dimensions and margin can also be customised.
 */
export interface AreaOptions {
  columns?: number;
  maxWidth?: number;
  cardWidth?: number;
  cardHeight?: number;
  margin?: number;
}

/**
 * Determine overall area dimensions and card positions.
 *
 * The returned positions are relative to the area centre so callers can
 * translate them to an absolute board location easily.
 */
export function prepareArea(
  count: number,
  options: AreaOptions = {},
): { width: number; height: number; positions: CardPosition[] } {
  if (count <= 0) {
    return { width: 0, height: 0, positions: [] };
  }

  const cardWidth = options.cardWidth ?? 300;
  const cardHeight = options.cardHeight ?? 200;
  const margin = options.margin ?? 50;

  let columns = options.columns ?? 0;
  if (!columns && options.maxWidth) {
    columns = Math.floor((options.maxWidth - margin * 2) / cardWidth);
  }
  if (columns <= 0 || columns > count) {
    columns = count;
  }

  const rows = Math.ceil(count / columns);
  const width = columns * cardWidth + margin * 2;
  const height = rows * cardHeight + margin * 2;

  const positions: CardPosition[] = [];
  const startX = -width / 2 + margin + cardWidth / 2;
  const startY = -height / 2 + margin + cardHeight / 2;
  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / columns);
    const col = i % columns;
    positions.push({
      x: startX + col * cardWidth,
      y: startY + row * cardHeight,
    });
  }

  return { width, height, positions };
}
