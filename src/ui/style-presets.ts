export interface StylePreset {
  id: string;
  label: string;
  fontColor: string;
  borderWidth: number;
  borderColor: string;
  fillColor: string;
}

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'primary',
    label: 'Primary',
    fontColor: 'var(--white)',
    borderWidth: 2,
    borderColor: 'var(--colors-blue-200)',
    fillColor: 'var(--colors-blue-150)',
  },
  {
    id: 'success',
    label: 'Success',
    fontColor: 'var(--white)',
    borderWidth: 2,
    borderColor: 'var(--colors-green-200)',
    fillColor: 'var(--colors-green-150)',
  },
  {
    id: 'warning',
    label: 'Warning',
    fontColor: 'var(--black)',
    borderWidth: 2,
    borderColor: 'var(--colors-yellow-200)',
    fillColor: 'var(--colors-yellow-150)',
  },
  {
    id: 'danger',
    label: 'Danger',
    fontColor: 'var(--white)',
    borderWidth: 2,
    borderColor: 'var(--colors-red-200)',
    fillColor: 'var(--colors-red-150)',
  },
];
