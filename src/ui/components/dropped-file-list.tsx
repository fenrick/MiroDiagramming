import React from 'react'

/**
 * Scrollable list styling for dropped files.
 */
export const DroppedFileList: React.FC<React.HTMLAttributes<HTMLUListElement>> = ({
  children,
  style,
  ...properties
}) => (
  <ul
    style={{
      listStyle: 'none',
      padding: 'var(--space-50) var(--space-100)',
      border: '2px dashed var(--blackAlpha20)',
      maxHeight: 'var(--size-dropped-files-max, 240px)',
      overflowY: 'auto',
      fontSize: 'var(--font-size-medium)',
      margin: 0,
      ...style,
    }}
    {...properties}
  >
    {children}
  </ul>
)
