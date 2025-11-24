import { Button } from '@base-ui-components/react/button'
import { Checkbox } from '@base-ui-components/react/checkbox'
import { Field } from '@base-ui-components/react/field'
import React from 'react'

import { CardProcessor } from '../../board/card-processor'
import {
  DroppedFileList,
  EmptyState,
  JsonDropZone,
  PageHelp,
  Skeleton,
  VisuallyHidden,
} from '../components'
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
        void undoLastImport(lastProc, () => {
          setLastProc(undefined)
        })
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
          globalThis.setTimeout(() => {
            setShowUndo(false)
          }, 3000)
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
      <div>
        <JsonDropZone onFiles={handleFiles} />
        {files.length === 0 && (
          <EmptyState
            title="Drop a JSON file"
            description="Drag a JSON file here or choose one to create cards."
          />
        )}
      </div>

      {files.length > 0 && (
        <section>
          <div title="Selected file">
            <DroppedFileList>
              {files.map((file) => (
                <li key={`${file.name}-${String(file.lastModified)}`}>{file.name}</li>
              ))}
            </DroppedFileList>
          </div>

          <fieldset>
            <VisuallyHidden asChild>
              <legend>Card options</legend>
            </VisuallyHidden>

            <label className="inline-field form-group form-group-small">
              <Checkbox.Root
                checked={withFrame}
                onCheckedChange={(checked) => {
                  setWithFrame(checked)
                }}
                className="checkbox"
              >
                <Checkbox.Indicator>✓</Checkbox.Indicator>
              </Checkbox.Root>
              <span>Wrap items in frame</span>
            </label>

            {withFrame && (
              <Field.Root className="form-group form-group-small">
                <Field.Label>Frame title</Field.Label>
                <Field.Control
                  value={frameTitle}
                  onValueChange={(value) => {
                    setFrameTitle(value)
                  }}
                  placeholder="Frame title"
                  className="input input-small"
                />
              </Field.Root>
            )}
          </fieldset>

          <section title="Create">
            <StickyActions>
              <div>
                <Button className="button button-primary button-medium" onClick={handleCreate}>
                  <span className="icon icon-plus" aria-hidden="true"></span>
                  <p className="p-medium">Create Cards</p>
                </Button>

                {showUndo && (
                  <Button
                    className="button button-secondary button-medium"
                    onClick={() =>
                      void undoLastImport(lastProc, () => {
                        setLastProc(undefined)
                      })
                    }
                  >
                    Undo import (⌘Z)
                  </Button>
                )}

                {lastProc && (
                  <Button
                    className="button button-secondary button-medium"
                    onClick={() =>
                      void undoLastImport(lastProc, () => {
                        setLastProc(undefined)
                      })
                    }
                  >
                    <span className="icon icon-undo" aria-hidden="true"></span>
                    <p className="p-medium">Undo Last Import</p>
                  </Button>
                )}
              </div>
            </StickyActions>

            {progress > 0 && progress < 100 && (
              <output aria-live="polite" aria-label="Loading">
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
