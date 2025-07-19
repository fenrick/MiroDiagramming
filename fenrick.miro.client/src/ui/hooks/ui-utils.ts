import { colors, fontSizes, fontWeights } from '@mirohq/design-tokens';
import { GraphProcessor } from '../../core/graph/graph-processor';
import { HierarchyProcessor } from '../../core/graph/hierarchy-processor';
import { CardProcessor } from '../../board/card-processor';
import type React from 'react';

const dropzoneStyles = {
  display: 'flex',
  height: '100%',
  flexDirection: 'column',
  justifyContent: 'center',
  textAlign: 'center',
  border: `3px dashed ${colors['alpha-black-400']}`,
  color: colors['gray-700'],
  fontWeight: fontWeights.semibold,
  fontSize: fontSizes[200],
} as const;

/** Undo last import and reset state helper. */
export async function undoLastImport(
  proc: GraphProcessor | HierarchyProcessor | CardProcessor | undefined,
  clear: () => void,
): Promise<void> {
  if (!proc) return;
  await proc.undoLast();
  clear();
}

/**
 * Compute the inline style for the dropzone element.
 * The border colour changes based on drag-and-drop state.
 */
export type DropzoneState = 'base' | 'accept' | 'reject';

export function getDropzoneStyle(state: DropzoneState): React.CSSProperties {
  let borderColor: string = colors['alpha-black-400'];
  if (state === 'accept') {
    borderColor = colors['green-700'];
  }
  if (state === 'reject') {
    borderColor = colors['red-700'];
  }
  return { ...dropzoneStyles, borderColor };
}
