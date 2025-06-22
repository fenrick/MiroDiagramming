/** Minimal design tokens mirrored from Mirotone CSS variables. */
export const tokens = {
  color: {
    indigoAlpha: { 40: 'var(--indigoAlpha40)' },
    indigo: { 700: 'var(--indigo700)' },
    green: { 700: 'var(--green700)', 150: 'var(--colors-green-150)' },
    red: {
      700: 'var(--red700)',
      600: 'var(--red600)',
      150: 'var(--colors-red-150)',
      200: 'var(--colors-red-200)',
    },
    yellow: {
      150: 'var(--colors-yellow-150)',
      200: 'var(--colors-yellow-200)',
      250: 'var(--colors-yellow-250)',
    },
    blue: {
      100: 'var(--colors-blue-100)',
      150: 'var(--colors-blue-150)',
      200: 'var(--colors-blue-200)',
    },
    gray: { 200: 'var(--colors-gray-200)' },
    white: 'var(--white)',
    black: 'var(--black)',
    primaryText: 'var(--primary-text-color)',
  },
  typography: {
    fontWeight: { bold: 'var(--font-weight-bold)' },
    fontSize: { large: 'var(--font-size-large)' },
  },
  space: {
    xxsmall: 'var(--space-xxsmall)',
    xsmall: 'var(--space-xsmall)',
    small: 'var(--space-small)',
    medium: 'var(--space-medium)',
    large: 'var(--space-large)',
    xlarge: 'var(--space-xlarge)',
  },
} as const;
