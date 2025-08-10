import React from 'react';
import { GraphProcessor } from '../../core/graph/graph-processor';
import { HierarchyProcessor } from '../../core/graph/hierarchy-processor';
import { ElkAlgorithm, UserLayoutOptions } from '../../core/layout/elk-options';
import { showError } from './notifications';

/** Configuration options controlling diagram creation. */

export type LayoutChoice =
  | 'Layered'
  | 'Tree'
  | 'Grid'
  | 'Nested'
  | 'Radial'
  | 'Box'
  | 'Rect Packing';

/** Options controlling how diagrams are created. */
interface CreateOptions {
  layoutChoice: LayoutChoice;
  showAdvanced: boolean;
  withFrame: boolean;
  frameTitle: string;
  layoutOpts: UserLayoutOptions;
  nestedPadding: number;
  nestedTopSpacing: number;
  existingMode: import('../../core/graph/graph-processor').ExistingNodeMode;
}

/**
 * Create a callback that processes dropped diagram files.
 *
 * @param importQueue - Files queued for import.
 * @param opts - Options controlling creation and layout.
 * @param setImportQueue - Setter to clear the queue after processing.
 * @param setProgress - Callback updating progress bar state.
 * @param setError - Callback reporting errors to the UI.
 * @param setLastProc - Setter for the last processor used.
 * @returns Async function executing the import.
 */
export function useDiagramCreate(
  importQueue: File[],
  opts: CreateOptions,
  setImportQueue: React.Dispatch<React.SetStateAction<File[]>>,
  setProgress: React.Dispatch<React.SetStateAction<number>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  setLastProc: React.Dispatch<GraphProcessor | HierarchyProcessor | undefined>,
): () => Promise<void> {
  const graphProcessor = React.useMemo(() => new GraphProcessor(), []);
  const hierarchyProcessor = React.useMemo(() => new HierarchyProcessor(), []);

  return React.useCallback(async () => {
    setProgress(0);
    setError(null);
    for (const file of importQueue) {
      try {
        if (opts.layoutChoice === 'Nested') {
          setLastProc(hierarchyProcessor);
          await hierarchyProcessor.processFile(file, {
            createFrame: opts.withFrame,
            frameTitle: opts.frameTitle || undefined,
            padding: opts.nestedPadding,
            topSpacing: opts.nestedTopSpacing,
          });
        } else {
          setLastProc(graphProcessor);
          const algorithmMap: Record<LayoutChoice, ElkAlgorithm> = {
            'Layered': 'layered',
            'Tree': 'mrtree',
            'Grid': 'force',
            'Nested': 'rectpacking',
            'Radial': 'radial',
            'Box': 'box',
            'Rect Packing': 'rectpacking',
          };
          const selectedAlg = opts.showAdvanced
            ? opts.layoutOpts.algorithm
            : algorithmMap[opts.layoutChoice];
          await graphProcessor.processFile(file, {
            createFrame: opts.withFrame,
            frameTitle: opts.frameTitle || undefined,
            layout: { ...opts.layoutOpts, algorithm: selectedAlg },
            existingMode: opts.existingMode,
          });
        }
        setProgress(100);
      } catch (e) {
        const msg = String(e);
        setError(msg);
        await showError(msg);
      }
    }
    setImportQueue([]);
  }, [
    importQueue,
    opts,
    graphProcessor,
    hierarchyProcessor,
    setError,
    setImportQueue,
    setLastProc,
    setProgress,
  ]);
}

/**
 * Toggle the advanced options panel with the `Ctrl+/` shortcut.
 *
 * @param setShow - State setter controlling visibility of the panel.
 */
export function useAdvancedToggle(
  setShow: React.Dispatch<React.SetStateAction<boolean>>,
): void {
  React.useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setShow(v => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setShow]);
}
