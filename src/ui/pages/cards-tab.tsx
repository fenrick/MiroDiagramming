import { Grid, IconArrowArcLeft, IconPlus, Text } from '@mirohq/design-system'
import React from 'react'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

import { CardProcessor } from '../../board/card-processor'
import {
  Button,
  ButtonToolbar,
  Checkbox,
  DroppedFileList,
  InputField,
  EmptyState,
  SidebarSection,
  Skeleton,
  JsonDropZone,
  PageHelp,
  TabPanel,
} from '../components'
import { StickyActions } from '../sticky-actions'
import { showError } from '../hooks/notifications'
import { undoLastImport } from '../hooks/ui-utilities'

/** UI for the Cards tab. */
export const CardsTab: React.FC = () => {
  const [files, setFiles] = React.useState<File[]>([])
  const [showUndo, setShowUndo] = React.useState(false)
  const [withFrame, setWithFrame] = React.useState(false)
  const [frameTitle, setFrameTitle] = React.useState('')
  const [progress, setProgress] = React.useState<number>(0)
  const [error, setError] = React.useState<string | null>(null)
  const [lastProc, setLastProc] = React.useState<CardProcessor | undefined>()

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
    if (droppedFiles.length === 0) {
      return
    }
    const file = droppedFiles[0]
    if (!file) {
      return
    }
    setFiles([file])
  }

  const cardProcessor = React.useMemo(() => new CardProcessor(), [])

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
    <TabPanel tabId="cards">
      <PageHelp content="Board-linked items with thumbnail and title" />
      <JsonDropZone onFiles={handleFiles} />
      {files.length === 0 && (
        <EmptyState
          title="Drop a JSON file"
          description="Drag a JSON file here or choose one to create cards."
        />
      )}

      {files.length > 0 && (
        <>
          <SidebarSection title="Selected file">
            <Grid columns={2}>
              <Grid.Item>
                <DroppedFileList>
                  {files.map((file) => (
                    <li key={`${file.name}-${String(file.lastModified)}`}>{file.name}</li>
                  ))}
                </DroppedFileList>
              </Grid.Item>
              <Grid.Item>
                <fieldset>
                  <VisuallyHidden asChild>
                    <legend>Card options</legend>
                  </VisuallyHidden>
                  <Checkbox label="Wrap items in frame" value={withFrame} onChange={setWithFrame} />
                  {withFrame && (
                    <InputField
                      label="Frame title"
                      value={frameTitle}
                      onValueChange={(v) => {
                        setFrameTitle(v)
                      }}
                      placeholder="Frame title"
                    />
                  )}
                </fieldset>
              </Grid.Item>
            </Grid>
          </SidebarSection>
          <SidebarSection title="Create">
            <StickyActions>
              <ButtonToolbar>
                <Button
                  onClick={handleCreate}
                  variant="primary"
                  icon={<IconPlus />}
                  iconPosition="start"
                >
                  <Text>Create Cards</Text>
                </Button>
                {showUndo && (
                  <Button
                    onClick={() => {
                      void undoLastImport(lastProc, () => {
                        setLastProc(undefined)
                      })
                    }}
                    variant="secondary"
                  >
                    Undo import (⌘Z)
                  </Button>
                )}
                {lastProc && (
                  <Button
                    onClick={() => {
                      void undoLastImport(lastProc, () => {
                        setLastProc(undefined)
                      })
                    }}
                    variant="secondary"
                    iconPosition="start"
                    icon={<IconArrowArcLeft />}
                  >
                    <Text>Undo Last Import</Text>
                  </Button>
                )}
              </ButtonToolbar>
            </StickyActions>
            {progress > 0 && progress < 100 && (
              <output
                aria-live="polite"
                aria-label="Loading"
                style={{ marginTop: 'var(--space-100)' }}
              >
                <Skeleton />
                <Skeleton />
              </output>
            )}
            {error && <p className="error">{error}</p>}
          </SidebarSection>
        </>
      )}
    </TabPanel>
  )
}
