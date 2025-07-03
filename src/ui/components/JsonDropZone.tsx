import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from './Button';
import { getDropzoneStyle } from '../hooks/ui-utils';
import { tokens } from '../tokens';
import { Paragraph } from './Paragraph';
import { IconSquareArrowIn, Text } from '@mirohq/design-system';

export type JsonDropZoneProps = Readonly<{
  /** Callback invoked with selected files. */
  onFiles: (files: File[]) => void;
}>;

/** Dropzone for importing JSON files. */
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

  return (
    <>
      <div
        {...dropzone.getRootProps({ style: dropzoneStyle })}
        aria-label='File drop area'
        aria-describedby='dropzone-instructions'>
        {(() => {
          const { onChange, ...rest } = dropzone.getInputProps();
          return (
            // Hidden file input so selecting a file triggers drop event
            <input
              className='custom-visually-hidden'
              data-testid='file-input'
              onChange={onChange}
              aria-label='JSON file input'
              {...rest}
            />
          );
        })()}
        {dropzone.isDragAccept ? (
          <Paragraph className='dnd-text'>Drop your JSON file here</Paragraph>
        ) : (
          <div style={{ padding: tokens.space.small }}>
            <Button
              variant='primary'
              iconPosition='start'
              icon={<IconSquareArrowIn />}>
              <Text>Select JSON file</Text>
            </Button>
            <Paragraph className='dnd-text'>
              Or drop your JSON file here
            </Paragraph>
          </div>
        )}
      </div>
      <Paragraph
        id='dropzone-instructions'
        className='custom-visually-hidden'>
        Press Enter to open the file picker or drop a JSON file on the area
        above.
      </Paragraph>
    </>
  );
}
