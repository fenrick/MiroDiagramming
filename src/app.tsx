import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { useDropzone } from 'react-dropzone';
import {
  Button,
  Checkbox,
  Input,
  InputLabel,
  Select,
  SelectOption,
  tokens,
} from 'mirotone-react';
import { GraphProcessor } from './GraphProcessor';
import { CardProcessor } from './CardProcessor';
import { showError } from './notifications';
import { ResizeTab, StyleTab, GridTab } from './tools';
import {
  ALGORITHMS,
  DEFAULT_LAYOUT_OPTIONS,
  DIRECTIONS,
  ElkAlgorithm,
  ElkDirection,
  UserLayoutOptions,
} from './elk-options';

// UI
const dropzoneStyles = {
  display: 'flex',
  height: '100%',
  flexDirection: 'column',
  justifyContent: 'center',
  textAlign: 'center',
  border: `3px dashed ${tokens.color.indigoAlpha[40]}`,
  color: tokens.color.indigo[700],
  fontWeight: tokens.typography.fontWeight.bold,
  fontSize: tokens.typography.fontSize.large,
} as const;

/** Undo last import and reset state helper. */
export async function undoLastImport(
  proc: GraphProcessor | CardProcessor | undefined,
  clear: () => void,
): Promise<void> {
  if (!proc) return;
  await proc.undoLast();
  clear();
}

/**
 * Compute the inline style for the dropzone element.
 * The border colour changes based on drag-and-drop state.
 */
export function getDropzoneStyle(
  accept: boolean,
  reject: boolean,
): React.CSSProperties {
  let borderColor: string = tokens.color.indigoAlpha[40];
  if (accept) {
    borderColor = tokens.color.green[700];
  }
  if (reject) {
    borderColor = tokens.color.red[700];
  }
  return {
    ...dropzoneStyles,
    borderColor,
  };
}

/**
 * React entry component that renders the file selection and mode
 * toggling user interface. Extraction as an exported constant allows
 * the component to be reused in tests without side effects.
 */
export const App: React.FC = () => {
  type Tab = 'diagram' | 'cards' | 'resize' | 'style' | 'grid';
  const [tab, setTab] = React.useState<Tab>('diagram');
  const [files, setFiles] = React.useState<File[]>([]);
  const [withFrame, setWithFrame] = React.useState(false);
  const [frameTitle, setFrameTitle] = React.useState('');
  const [progress, setProgress] = React.useState<number>(0);
  const [error, setError] = React.useState<string | null>(null);
  const [layoutOpts, setLayoutOpts] = React.useState<UserLayoutOptions>(
    DEFAULT_LAYOUT_OPTIONS,
  );
  const [lastProc, setLastProc] = React.useState<
    GraphProcessor | CardProcessor | undefined
  >(undefined);
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
  const cardProcessor = React.useMemo(() => new CardProcessor(), []);

  const handleCreate = async () => {
    setProgress(0);
    setError(null);
    for (const file of files) {
      try {
        if (tab === 'diagram') {
          setLastProc(graphProcessor);
          await graphProcessor.processFile(file, {
            createFrame: withFrame,
            frameTitle: frameTitle || undefined,
            layout: layoutOpts,
          });
        } else if (tab === 'cards') {
          setLastProc(cardProcessor);
          await cardProcessor.processFile(file, {
            createFrame: withFrame,
            frameTitle: frameTitle || undefined,
          });
        }
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
    [dropzone.isDragActive, dropzone.isDragReject],
  );

  return (
    <div className='dnd-container'>
      <nav className='tabs' role='tablist'>
        {(['diagram', 'cards', 'resize', 'style', 'grid'] as Tab[]).map(t => (
          <Button
            key={t}
            role='tab'
            variant={tab === t ? 'primary' : 'secondary'}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </Button>
        ))}
      </nav>
      {tab === 'diagram' || tab === 'cards' ? (
        <p>
          Select the JSON file to import{' '}
          {tab === 'diagram' ? 'a diagram' : 'a list of cards'}
        </p>
      ) : null}
      {(tab === 'diagram' || tab === 'cards') && (
        <>
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
        </>
      )}

      {(tab === 'diagram' || tab === 'cards') && files.length > 0 && (
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

          {tab === 'diagram' && (
            <>
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
            </>
          )}

          <Button onClick={handleCreate} size='small' variant='primary'>
            {tab === 'diagram' ? 'Create Diagram' : 'Create Cards'}
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
      {tab === 'resize' && <ResizeTab />}
      {tab === 'style' && <StyleTab />}
      {tab === 'grid' && <GridTab />}
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
