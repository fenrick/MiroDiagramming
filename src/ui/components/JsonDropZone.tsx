import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from './Button';
<<<<<<< HEAD
import { Form, Input } from '@mirohq/design-system';
=======
>>>>>>> 3a8fb55 (fix(ui): trigger upload processing)
import { getDropzoneStyle } from '../hooks/ui-utils';
import { space } from '@mirohq/design-tokens';
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
        {(() => {
          const {
            style: _style,
            className: _class,
            ...inputProps
          } = dropzone.getInputProps({
            'aria-label': 'JSON file input',
          }) as Record<string, unknown>;
          void _style;
          void _class;
          return (
            <InputField
              label='JSON file'
              type='file'
              data-testid='file-input'
              {...inputProps}
            />
          );
        })()}
        {dropzone.isDragAccept ? (
          <p style={{ margin: tokens.space.small }}>Drop your JSON file here</p>
        ) : (
          <div style={{ padding: space[200] }}>
            <Button
              variant='primary'
              iconPosition='start'
              icon={<IconSquareArrowIn />}>
              <Text>Select JSON file</Text>
            </Button>
            <p style={{ marginTop: tokens.space.small }}>
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
