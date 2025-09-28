import { IconSquareArrowIn, Text } from '@mirohq/design-system'
import React from 'react'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { useDropzone } from 'react-dropzone'

import { getDropzoneStyle } from '../hooks/ui-utilities'

import { Button } from './button'

export type JsonDropZoneProperties = Readonly<{
  /** Callback invoked with selected files. */
  onFiles: (files: File[]) => void
}>

/**
 * Dropzone for importing a single JSON file.
 *
 * The hidden input forwards its change event to react-dropzone so both
 * drag-and-drop and file picker interactions invoke `onFiles` uniformly.
 */
export function JsonDropZone({ onFiles }: JsonDropZoneProperties): React.JSX.Element {
  const SP200 = 'var(--space-200)'
  const MSG_SELECT = 'Select JSON file'
  const MSG_DROP = 'Drop your JSON file here'
  const MSG_INSTRUCTIONS =
    'Press Enter to open the file picker or drop a JSON file on the area above.'
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

  const { onChange, ...fileInputProperties } = dropzone.getInputProps()

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
            {...fileInputProperties}
          />
        </VisuallyHidden>
        {dropzone.isDragAccept ? (
          <p style={{ margin: SP200 }}>{MSG_DROP}</p>
        ) : (
          <div style={{ padding: SP200 }}>
            <Button variant="primary" iconPosition="start" icon={<IconSquareArrowIn />}>
              <Text>{MSG_SELECT}</Text>
            </Button>
            <p style={{ marginTop: SP200 }}>Or {MSG_DROP}</p>
          </div>
        )}
      </div>
      <VisuallyHidden asChild>
        <p id="dropzone-instructions">{MSG_INSTRUCTIONS}</p>
      </VisuallyHidden>
    </>
  )
}
