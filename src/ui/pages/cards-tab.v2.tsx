import { IconArrowArcLeft, IconPlus, Text } from '@mirohq/design-system'
import { Button as BaseButton } from '@base-ui-components/react/button'
import { Checkbox } from '@base-ui-components/react/checkbox'
import { Input } from '@base-ui-components/react/input'
import React from 'react'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

import { CardProcessor } from '../../board/card-processor'
import { DroppedFileList, EmptyState, JsonDropZone, PageHelp, Skeleton } from '../components'
import { StickyActions } from '../sticky-actions'
import { showError } from '../hooks/notifications'
import { undoLastImport } from '../hooks/ui-utilities'

export const CardsTabV2: React.FC = () => {
  const [files, setFiles] = React.useState<File[]>([])
  const [showUndo, setShowUndo] = React.useState(false)
  const [withFrame, setWithFrame] = React.useState(false)
  const [frameTitle, setFrameTitle] = React.useState('')
  const [progress, setProgress] = React.useState<number>(0)
  const [error, setError] = React.useState<string | null>(null)
  const [lastProc, setLastProc] = React.useState<CardProcessor | undefined>()

  const cardProcessor = React.useMemo(() => new CardProcessor(), [])

  React.useEffect(() => {
    const handler = (event: KeyboardEvent): void => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        void undoLastImport(lastProc, () => setLastProc(undefined))
      }
    }
    globalThis.addEventListener('keydown', handler)
    return () => {
      globalThis.removeEventListener('keydown', handler)
    }
  }, [lastProc])

  const handleFiles = (droppedFiles: File[]): void => {
    if (droppedFiles.length === 0) return
    const file = droppedFiles[0]
    if (!file) return
    setFiles([file])
  }

  const handleCreate = (): void => {
    void (async () => {
      setProgress(0)
      setError(null)
      for (const file of files) {
        try {
          setLastProc(cardProcessor)
          await cardProcessor.processFile(file, {
            createFrame: withFrame,
            frameTitle: frameTitle || undefined,
          })
          setProgress(100)
          setShowUndo(true)
          globalThis.setTimeout(() => setShowUndo(false), 3000)
        } catch (error_) {
          const message = String(error_)
          setError(message)
          showError(message)
        }
      }
      setFiles([])
    })()
  }

  return (
    <div className="panel-section stack-md">
      <PageHelp content="Board-linked items with thumbnail and title" />
      <div className="stack-sm">
        <JsonDropZone onFiles={handleFiles} />
        {files.length === 0 && (
          <EmptyState
            title="Drop a JSON file"
            description="Drag a JSON file here or choose one to create cards."
          />
        )}
      </div>

      {files.length > 0 && (
        <section className="stack-md">
          <div className="stack-sm" title="Selected file">
            <DroppedFileList>
              {files.map((file) => (
                <li key={`${file.name}-${String(file.lastModified)}`}>{file.name}</li>
              ))}
            </DroppedFileList>
          </div>

          <fieldset className="stack-sm" style={{ border: 'none', padding: 0, margin: 0 }}>
            <VisuallyHidden asChild>
              <legend>Card options</legend>
            </VisuallyHidden>

            <label className="inline-field">
              <Checkbox.Root
                checked={withFrame}
                onCheckedChange={(checked) => setWithFrame(Boolean(checked))}
                className="checkbox"
              >
                <Checkbox.Indicator>✓</Checkbox.Indicator>
              </Checkbox.Root>
              <span>Wrap items in frame</span>
            </label>

            {withFrame && (
              <label className="stack-2xs" style={{ maxWidth: 280 }}>
                <span className="label">Frame title</span>
                <Input
                  value={frameTitle}
                  onValueChange={(v) => setFrameTitle(String(v))}
                  placeholder="Frame title"
                  className="input"
                />
              </label>
            )}
          </fieldset>

          <section className="stack-sm" title="Create">
            <StickyActions>
              <div className="button-group">
                <BaseButton className="button button-primary" onClick={handleCreate}>
                  <IconPlus />
                  <Text>Create Cards</Text>
                </BaseButton>

                {showUndo && (
                  <BaseButton
                    className="button button-secondary"
                    onClick={() => void undoLastImport(lastProc, () => setLastProc(undefined))}
                  >
                    Undo import (⌘Z)
                  </BaseButton>
                )}

                {lastProc && (
                  <BaseButton
                    className="button button-secondary"
                    onClick={() => void undoLastImport(lastProc, () => setLastProc(undefined))}
                  >
                    <IconArrowArcLeft />
                    <Text>Undo Last Import</Text>
                  </BaseButton>
                )}
              </div>
            </StickyActions>

            {progress > 0 && progress < 100 && (
              <output aria-live="polite" aria-label="Loading" className="stack-2xs">
                <Skeleton />
                <Skeleton />
              </output>
            )}
            {error && <p className="error">{error}</p>}
          </section>
        </section>
      )}
    </div>
  )
}

export default CardsTabV2
