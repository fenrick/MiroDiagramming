import React from 'react'

/**
 * Scrollable list styling for dropped files.
 */
export const DroppedFileList: React.FC<React.HTMLAttributes<HTMLUListElement>> = ({
  children,
  ...properties
}) => <ul {...properties}>{children}</ul>
