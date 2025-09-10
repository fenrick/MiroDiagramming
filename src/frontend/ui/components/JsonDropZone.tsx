import { IconSquareArrowIn, Text } from '@mirohq/design-system'
import React from 'react'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { useDropzone } from 'react-dropzone'
import { getDropzoneStyle } from '../hooks/ui-utils'
import { Button } from './Button'

export type JsonDropZoneProps = Readonly<{
  /** Callback invoked with selected files. */
  onFiles: (files: File[]) => void
}>

/**
 * Dropzone for importing a single JSON file.
 *
 * The hidden input forwards its change event to react-dropzone so both
 * drag-and-drop and file picker interactions invoke `onFiles` uniformly.
 */
export function JsonDropZone({ onFiles }: JsonDropZoneProps): React.JSX.Element {
  const dropzone = useDropzone({
    accept: { 'application/json': ['.json'] },
    maxFiles: 1,
    onDrop: onFiles,
  })

  const dropzoneStyle = React.useMemo(() => {
    let state: Parameters<typeof getDropzoneStyle>[0] = 'base'
    if (dropzone.isDragReject) {
      state = 'reject'
    } else if (dropzone.isDragAccept) {
      state = 'accept'
    }
    return getDropzoneStyle(state)
  }, [dropzone.isDragAccept, dropzone.isDragReject])

  const { onChange, ...fileInputProps } = dropzone.getInputProps()

  return (
    <>
      <div
        {...dropzone.getRootProps({ style: dropzoneStyle })}
        aria-label="File drop area"
        aria-describedby="dropzone-instructions"
      >
        {/* hidden input ensures keyboard selection triggers the drop handler */}
        <VisuallyHidden asChild>
          <input
            data-testid="file-input"
            onChange={onChange}
            aria-label="JSON file input"
            {...fileInputProps}
          />
        </VisuallyHidden>
        {dropzone.isDragAccept ? (
          <p style={{ margin: 'var(--space-200)' }}>Drop your JSON file here</p>
        ) : (
          <div style={{ padding: 'var(--space-200)' }}>
            <Button variant="primary" iconPosition="start" icon={<IconSquareArrowIn />}>
              <Text>Select JSON file</Text>
            </Button>
            <p style={{ marginTop: 'var(--space-200)' }}>Or drop your JSON file here</p>
          </div>
        )}
      </div>
      <VisuallyHidden asChild>
        <p id="dropzone-instructions">
          Press Enter to open the file picker or drop a JSON file on the area above.
        </p>
      </VisuallyHidden>
    </>
  )
}
