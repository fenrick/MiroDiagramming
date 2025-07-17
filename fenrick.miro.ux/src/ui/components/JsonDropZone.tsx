import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from './Button';
import { getDropzoneStyle } from '../hooks/ui-utils';
import { space as dsSpace } from '@mirohq/design-tokens';

// Provide semantic spacing aliases until the design tokens include them.
const space = { ...dsSpace, small: dsSpace[200] } as const;
import { IconSquareArrowIn, Text } from '@mirohq/design-system';

export type JsonDropZoneProps = Readonly<{
  /** Callback invoked with selected files. */
  onFiles: (files: File[]) => void;
}>;

/**
 * Dropzone for importing a single JSON file.
 *
 * The hidden input forwards its change event to react-dropzone so both
 * drag-and-drop and file picker interactions invoke `onFiles` uniformly.
 */
export function JsonDropZone({
  onFiles,
}: JsonDropZoneProps): React.JSX.Element {
  const dropzone = useDropzone({
    accept: { 'application/json': ['.json'] },
    maxFiles: 1,
    onDrop: onFiles,
  });

  const dropzoneStyle = React.useMemo(() => {
    let state: Parameters<typeof getDropzoneStyle>[0] = 'base';
    if (dropzone.isDragReject) {
      state = 'reject';
    } else if (dropzone.isDragAccept) {
      state = 'accept';
    }
    return getDropzoneStyle(state);
  }, [dropzone.isDragAccept, dropzone.isDragReject]);

  const { onChange, ...fileInputProps } = dropzone.getInputProps();

  return (
    <>
      <div
        {...dropzone.getRootProps({ style: dropzoneStyle })}
        aria-label='File drop area'
        aria-describedby='dropzone-instructions'>
        {/* hidden input ensures keyboard selection triggers the drop handler */}
        <input
          className='custom-visually-hidden'
          data-testid='file-input'
          onChange={onChange}
          aria-label='JSON file input'
          {...fileInputProps}
        />
        {dropzone.isDragAccept ? (
          <p style={{ margin: space.small }}>Drop your JSON file here</p>
        ) : (
          <div style={{ padding: space[200] }}>
            <Button
              variant='primary'
              iconPosition='start'
              icon={<IconSquareArrowIn />}>
              <Text>Select JSON file</Text>
            </Button>
            <p style={{ marginTop: space.small }}>
              Or drop your JSON file here
            </p>
          </div>
        )}
      </div>
      <p
        id='dropzone-instructions'
        className='custom-visually-hidden'>
        Press Enter to open the file picker or drop a JSON file on the area
        above.
      </p>
    </>
  );
}
