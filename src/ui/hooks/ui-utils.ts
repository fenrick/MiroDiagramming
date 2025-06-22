import { tokens } from '../tokens';
import { GraphProcessor } from '../../core/graph/GraphProcessor';
import { CardProcessor } from '../../board/CardProcessor';
import type React from 'react';

const dropzoneStyles = {
  display: 'flex',
  height: '100%',
  flexDirection: 'column',
  justifyContent: 'center',
  textAlign: 'center',
  border: `3px dashed ${tokens.color.indigoAlpha[40]}`,
  color: tokens.color.indigo[700],
  fontWeight: tokens.typography.fontWeight.bold,
  fontSize: tokens.typography.fontSize.large,
} as const;

/** Undo last import and reset state helper. */
export async function undoLastImport(
  proc: GraphProcessor | CardProcessor | undefined,
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
export function getDropzoneStyle(
  accept: boolean,
  reject: boolean,
): React.CSSProperties {
  let borderColor: string = tokens.color.indigoAlpha[40];
  if (accept) {
    borderColor = tokens.color.green[700];
  }
  if (reject) {
    borderColor = tokens.color.red[700];
  }
  return {
    ...dropzoneStyles,
    borderColor,
  };
}
