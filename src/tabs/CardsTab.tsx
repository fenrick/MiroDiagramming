import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Button, Checkbox, Input, tokens } from 'mirotone-react';
import { CardProcessor } from '../CardProcessor';
import { showError } from '../notifications';
import { getDropzoneStyle, undoLastImport } from '../ui-utils';

/** UI for the Cards tab. */
export const CardsTab: React.FC = () => {
  const [files, setFiles] = React.useState<File[]>([]);
  const [withFrame, setWithFrame] = React.useState(false);
  const [frameTitle, setFrameTitle] = React.useState('');
  const [progress, setProgress] = React.useState<number>(0);
  const [error, setError] = React.useState<string | null>(null);
  const [lastProc, setLastProc] = React.useState<CardProcessor | undefined>(
    undefined,
  );

  const dropzone = useDropzone({
    accept: {
      'application/json': ['.json'],
    },
    maxFiles: 1,
    onDrop: (droppedFiles: File[]) => {
      const file = droppedFiles[0];
      setFiles([file]);
    },
  });

  const cardProcessor = React.useMemo(() => new CardProcessor(), []);

  const handleCreate = async (): Promise<void> => {
    setProgress(0);
    setError(null);
    for (const file of files) {
      try {
        setLastProc(cardProcessor);
        await cardProcessor.processFile(file, {
          createFrame: withFrame,
          frameTitle: frameTitle || undefined,
        });
        setProgress(100);
      } catch (e) {
        const msg = String(e);
        setError(msg);
        await showError(msg);
      }
    }
    setFiles([]);
  };

  const style = React.useMemo(
    () => getDropzoneStyle(dropzone.isDragAccept, dropzone.isDragReject),
    [dropzone.isDragAccept, dropzone.isDragReject],
  );

  return (
    <div>
      <p>Select the JSON file to import a list of cards</p>
      <div
        {...dropzone.getRootProps({ style })}
        aria-label='File drop area'
        aria-describedby='dropzone-instructions'
      >
        <input
          data-testid='file-input'
          {...dropzone.getInputProps({ 'aria-label': 'JSON file input' })}
        />
        {dropzone.isDragAccept ? (
          <p className='dnd-text'>Drop your JSON file here</p>
        ) : (
          <>
            <div>
              <Button variant='primary' type='button'>
                Select JSON file
              </Button>
              <p className='dnd-text'>Or drop your JSON file here</p>
            </div>
          </>
        )}
      </div>
      <p id='dropzone-instructions' className='visually-hidden'>
        Press Enter to open the file picker or drop a JSON file on the area
        above.
      </p>

      {files.length > 0 && (
        <>
          <ul className='dropped-files'>
            {files.map((file, i) => (
              <li key={i}>{file.name}</li>
            ))}
          </ul>
          <div style={{ marginTop: tokens.space.small }}>
            <Checkbox
              label='Wrap items in frame'
              value={withFrame}
              onChange={setWithFrame}
            />
          </div>
          {withFrame && (
            <Input
              placeholder='Frame title'
              value={frameTitle}
              onChange={setFrameTitle}
              style={{ marginTop: tokens.space.xsmall }}
            />
          )}
          <Button onClick={handleCreate} size='small' variant='primary'>
            Create Cards
          </Button>
          {progress > 0 && progress < 100 && (
            <progress value={progress} max={100} />
          )}
          {error && <p className='error'>{error}</p>}
          {lastProc && (
            <Button
              onClick={() => {
                void undoLastImport(lastProc, () => setLastProc(undefined));
              }}
              size='small'
            >
              Undo Last Import
            </Button>
          )}
        </>
      )}
    </div>
  );
};
