import type React from 'react'

import { type CardProcessor } from '../../board/card-processor'
import { type GraphProcessor } from '../../core/graph/graph-processor'
import { type HierarchyProcessor } from '../../core/graph/hierarchy-processor'
import { getColor } from '../../core/theme/colors'

const weightSemibold = 600
const size200 = '1rem'

const dropzoneStyles = {
  display: 'flex',
  height: '100%',
  flexDirection: 'column',
  justifyContent: 'center',
  textAlign: 'center',
  borderWidth: 'var(--border-widths-md)',
  borderStyle: 'dashed',
  borderColor: getColor('alpha-black-400'),
  color: getColor('gray-700'),
  fontWeight: weightSemibold,
  fontSize: size200,
} as const

/** Undo last import and reset state helper. */
export async function undoLastImport(
  proc: GraphProcessor | HierarchyProcessor | CardProcessor | undefined,
  clear: () => void,
): Promise<void> {
  if (!proc) {
    return
  }
  await proc.undoLast()
  clear()
}

/**
 * Compute the inline style for the dropzone element.
 * The border colour changes based on drag-and-drop state.
 */
export type DropzoneState = 'base' | 'accept' | 'reject'

export function getDropzoneStyle(state: DropzoneState): React.CSSProperties {
  let borderColor: string = getColor('alpha-black-400')
  if (state === 'accept') {
    borderColor = getColor('green-700')
  }
  if (state === 'reject') {
    borderColor = getColor('red-700')
  }
  return { ...dropzoneStyles, borderColor }
}
