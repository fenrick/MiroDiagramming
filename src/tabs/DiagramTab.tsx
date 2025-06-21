import React from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Button,
  Checkbox,
  Icon,
  Input,
  InputLabel,
  Paragraph,
  Select,
  SelectOption,
  tokens,
  Text,
} from 'mirotone-react';
import { GraphProcessor } from '../GraphProcessor';
import { showError } from '../notifications';
import {
  ALGORITHMS,
  DEFAULT_LAYOUT_OPTIONS,
  DIRECTIONS,
  ElkAlgorithm,
  ElkDirection,
  UserLayoutOptions,
} from '../elk-options';
import { getDropzoneStyle, undoLastImport } from '../ui-utils';

/** UI for the Diagram tab. */
export const DiagramTab: React.FC = () => {
  const [files, setFiles] = React.useState<File[]>([]);
  const [withFrame, setWithFrame] = React.useState(false);
  const [frameTitle, setFrameTitle] = React.useState('');
  const [layoutOpts, setLayoutOpts] = React.useState<UserLayoutOptions>(
    DEFAULT_LAYOUT_OPTIONS,
  );
  const [progress, setProgress] = React.useState<number>(0);
  const [error, setError] = React.useState<string | null>(null);
  const [lastProc, setLastProc] = React.useState<GraphProcessor | undefined>(
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

  const graphProcessor = React.useMemo(() => new GraphProcessor(), []);

  const handleCreate = async (): Promise<void> => {
    setProgress(0);
    setError(null);
    for (const file of files) {
      try {
        setLastProc(graphProcessor);
        await graphProcessor.processFile(file, {
          createFrame: withFrame,
          frameTitle: frameTitle || undefined,
          layout: layoutOpts,
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
      <Paragraph>Select the JSON file to import a diagram</Paragraph>
      <div
        {...dropzone.getRootProps({ style })}
        aria-label='File drop area'
        aria-describedby='dropzone-instructions'
      >
        <InputLabel>
          JSON file
          <input
            data-testid='file-input'
            {...dropzone.getInputProps({ 'aria-label': 'JSON file input' })}
          />
        </InputLabel>
        {dropzone.isDragAccept ? (
          <Paragraph className='dnd-text'>Drop your JSON file here</Paragraph>
        ) : (
          <>
            <div style={{ padding: tokens.space.small }}>
              <Button variant='primary'>
                <React.Fragment key='.0'>
                  <Icon name='upload' />
                  <Text>Select JSON file</Text>
                </React.Fragment>
              </Button>
              <Paragraph className='dnd-text'>
                Or drop your JSON file here
              </Paragraph>
            </div>
          </>
        )}
      </div>
      <Paragraph id='dropzone-instructions' className='visually-hidden'>
        Press Enter to open the file picker or drop a JSON file on the area
        above.
      </Paragraph>

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
            <InputLabel>
              Frame title
              <Input
                placeholder='Frame title'
                value={frameTitle}
                onChange={setFrameTitle}
              />
            </InputLabel>
          )}
          <InputLabel>
            Algorithm
            <Select
              value={layoutOpts.algorithm}
              onChange={value =>
                setLayoutOpts({
                  ...layoutOpts,
                  algorithm: value as ElkAlgorithm,
                })
              }
            >
              {ALGORITHMS.map(a => (
                <SelectOption key={a} value={a}>
                  {a}
                </SelectOption>
              ))}
            </Select>
          </InputLabel>
          <InputLabel>
            Direction
            <Select
              value={layoutOpts.direction}
              onChange={value =>
                setLayoutOpts({
                  ...layoutOpts,
                  direction: value as ElkDirection,
                })
              }
            >
              {DIRECTIONS.map(d => (
                <SelectOption key={d} value={d}>
                  {d}
                </SelectOption>
              ))}
            </Select>
          </InputLabel>
          <InputLabel>
            Spacing
            <Input
              type='number'
              value={String(layoutOpts.spacing)}
              onChange={value =>
                setLayoutOpts({
                  ...layoutOpts,
                  spacing: Number(value),
                })
              }
            />
          </InputLabel>
          <Button onClick={handleCreate} size='small' variant='primary'>
            <React.Fragment key='.0'>
              <Icon name='plus' />
              <Text>Create Diagram</Text>
            </React.Fragment>
          </Button>
          {progress > 0 && progress < 100 && (
            <progress value={progress} max={100} />
          )}
          {error && <Paragraph className='error'>{error}</Paragraph>}
          {lastProc && (
            <Button
              onClick={() => {
                void undoLastImport(lastProc, () => setLastProc(undefined));
              }}
              size='small'
              variant='secondary'
            >
              <React.Fragment key='.0'>
                <Icon name='undo' />
                <Text>Undo Last Import</Text>
              </React.Fragment>
            </Button>
          )}
        </>
      )}
    </div>
  );
};
