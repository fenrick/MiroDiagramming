import React from 'react'

import { GraphProcessor } from '../../core/graph/graph-processor'
import { HierarchyProcessor } from '../../core/graph/hierarchy-processor'
import type { ElkAlgorithm, UserLayoutOptions } from '../../core/layout/elk-options'
import type { ExistingNodeMode } from '../../core/graph/graph-processor'

import { showError } from './notifications'

/** Configuration options controlling diagram creation. */

export type LayoutChoice =
  | 'Layered'
  | 'Tree'
  | 'Grid'
  | 'Nested'
  | 'Radial'
  | 'Box'
  | 'Rect Packing'

/** Options controlling how diagrams are created. */
interface CreateOptions {
  layoutChoice: LayoutChoice
  showAdvanced: boolean
  withFrame: boolean
  frameTitle: string
  layoutOpts: UserLayoutOptions
  nestedPadding: number
  nestedTopSpacing: number
  existingMode: ExistingNodeMode
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
  options: CreateOptions,
  setImportQueue: React.Dispatch<React.SetStateAction<File[]>>,
  setProgress: React.Dispatch<React.SetStateAction<number>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  setLastProc: React.Dispatch<GraphProcessor | HierarchyProcessor | undefined>,
): () => Promise<void> {
  const graphProcessor = React.useMemo(() => new GraphProcessor(), [])
  const hierarchyProcessor = React.useMemo(() => new HierarchyProcessor(), [])

  return React.useCallback(async () => {
    setProgress(0)
    setError(null)
    const algorithmMap: Record<LayoutChoice, ElkAlgorithm> = {
      Layered: 'layered',
      Tree: 'mrtree',
      Grid: 'force',
      Nested: 'rectpacking',
      Radial: 'radial',
      Box: 'box',
      'Rect Packing': 'rectpacking',
    }
    const processNested = async (file: File): Promise<void> => {
      setLastProc(hierarchyProcessor)
      await hierarchyProcessor.processFile(file, {
        createFrame: options.withFrame,
        frameTitle: options.frameTitle || undefined,
        padding: options.nestedPadding,
        topSpacing: options.nestedTopSpacing,
      })
    }
    const processFlat = async (file: File): Promise<void> => {
      setLastProc(graphProcessor)
      const selectedAlg = options.showAdvanced
        ? options.layoutOpts.algorithm
        : algorithmMap[options.layoutChoice]
      await graphProcessor.processFile(file, {
        createFrame: options.withFrame,
        frameTitle: options.frameTitle || undefined,
        layout: { ...options.layoutOpts, algorithm: selectedAlg },
        existingMode: options.existingMode,
      })
    }
    for (const file of importQueue) {
      try {
        await (options.layoutChoice === 'Nested' ? processNested(file) : processFlat(file))
        setProgress(100)
      } catch (error) {
        const message = String(error)
        setError(message)
        await showError(message)
      }
    }
    setImportQueue([])
  }, [
    importQueue,
    options,
    graphProcessor,
    hierarchyProcessor,
    setError,
    setImportQueue,
    setLastProc,
    setProgress,
  ])
}

/**
 * Toggle the advanced options panel with the `Ctrl+/` shortcut.
 *
 * @param setShow - State setter controlling visibility of the panel.
 */
// No custom keyboard shortcuts in Miro add-ins.
