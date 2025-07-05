import { colors, fontSizes, fontWeights, space } from '@mirohq/design-tokens';

/** Minimal subset of official design tokens used throughout the UI. */
export const tokens = {
  color: {
    indigoAlpha: { 40: colors['alpha-black-400'] },
    indigo: { 700: colors['gray-700'] },
    green: { 700: colors['green-700'], 150: colors['green-150'] },
    red: {
      700: colors['red-700'],
      600: colors['red-600'],
      150: colors['red-150'],
      200: colors['red-200'],
    },
    yellow: {
      150: colors['yellow-150'],
      200: colors['yellow-200'],
      250: colors['yellow-250'],
    },
    blue: {
      100: colors['blue-100'],
      150: colors['blue-150'],
      200: colors['blue-200'],
    },
    gray: { 200: colors['gray-200'] },
    white: colors.white,
    black: colors.black,
    primaryText: colors['gray-700'],
  },
  typography: {
    fontWeight: { bold: fontWeights.semibold },
    fontSize: { large: fontSizes[200] },
  },
  space: {
    xxsmall: space[50],
    xsmall: space[100],
    small: space[200],
    medium: space[300],
    large: space[400],
    xlarge: space[500],
  },
} as const;
