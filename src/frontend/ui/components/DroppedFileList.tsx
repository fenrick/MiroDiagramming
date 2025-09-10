import { styled } from '@mirohq/design-system'

/**
 * Scrollable list styling for dropped files.
 */
export const DroppedFileList = styled('ul', {
  listStyle: 'none',
  padding: 'var(--space-50) var(--space-100)',
  border: 'var(--border-widths-md) dashed var(--colors-alpha-black-400)',
  maxHeight: 'var(--size-dropped-files-max)',
  overflowY: 'auto',
  fontSize: 'var(--font-200)',
  margin: 0,
})
