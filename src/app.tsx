import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { useDropzone } from 'react-dropzone';
import { GraphProcessor } from './GraphProcessor';
import { CardProcessor } from './CardProcessor';

// UI
const dropzoneStyles = {
  display: 'flex',
  height: '100%',
  flexDirection: 'column',
  justifyContent: 'center',
  textAlign: 'center',
  border: '3px dashed rgba(41, 128, 185, 0.5)',
  color: 'rgba(41, 128, 185, 1.0)',
  fontWeight: 'bold',
  fontSize: '1.2em',
} as const;

/**
 * React entry component that renders the file selection and mode
 * toggling user interface. Extraction as an exported constant allows
 * the component to be reused in tests without side effects.
 */
export const App: React.FC = () => {
  const [files, setFiles] = React.useState<File[]>([]);
  const [withFrame, setWithFrame] = React.useState(false);
  const [frameTitle, setFrameTitle] = React.useState('');
  const [mode, setMode] = React.useState<'diagram' | 'cards'>('diagram');
  const [preview, setPreview] = React.useState<string>('');
  const [progress, setProgress] = React.useState<number>(0);
  const [error, setError] = React.useState<string | null>(null);
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
      const reader = new FileReader();
      reader.onload = e => {
        const text = String(e.target?.result || '');
        setPreview(text.slice(0, 200));
      };
      reader.readAsText(file);
    },
  });

  const graphProcessor = React.useMemo(() => new GraphProcessor(), []);
  const cardProcessor = React.useMemo(() => new CardProcessor(), []);

  const handleCreate = async () => {
    setProgress(0);
    setError(null);
    for (const file of files) {
      try {
        if (mode === 'diagram') {
          setLastProc(graphProcessor);
          await graphProcessor.processFile(file, {
            createFrame: withFrame,
            frameTitle: frameTitle || undefined,
          });
        } else {
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
        miro.board.notifications.showError(msg);
      }
    }
    setFiles([]);
  };

  const style = React.useMemo(() => {
    let borderColor = 'rgba(41, 128, 185, 0.5)';
    if (dropzone.isDragAccept) {
      borderColor = 'rgba(41, 128, 185, 1.0)';
    }

    if (dropzone.isDragReject) {
      borderColor = 'rgba(192, 57, 43,1.0)';
    }
    return {
      ...dropzoneStyles,
      borderColor,
    };
  }, [dropzone.isDragActive, dropzone.isDragReject]);

  return (
    <div className="dnd-container">
      <div style={{ marginBottom: '8px' }}>
        <label>
          <input
            type="radio"
            value="diagram"
            checked={mode === 'diagram'}
            onChange={() => setMode('diagram')}
          />
          Diagram
        </label>
        <label style={{ marginLeft: '8px' }}>
          <input
            type="radio"
            value="cards"
            checked={mode === 'cards'}
            onChange={() => setMode('cards')}
          />
          Cards
        </label>
      </div>
      <p>
        Select the JSON file to import{' '}
        {mode === 'diagram' ? 'a diagram' : 'a list of cards'}
      </p>
      <div {...dropzone.getRootProps({ style })}>
        <input data-testid="file-input" {...dropzone.getInputProps()} />
        {dropzone.isDragAccept ? (
          <p className="dnd-text">Drop your JSON file here</p>
        ) : (
          <>
            <div>
              <button
                type="button"
                className="button button-primary button-small"
              >
                Select JSON file
              </button>
              <p className="dnd-text">Or drop your JSON file here</p>
            </div>
          </>
        )}
      </div>
      {files.length > 0 && (
        <>
          <ul className="dropped-files">
            {files.map((file, i) => (
              <li key={i}>{file.name}</li>
            ))}
          </ul>
          <label style={{ display: 'block', marginTop: '8px' }}>
            <input
              type="checkbox"
              checked={withFrame}
              onChange={e => setWithFrame(e.target.checked)}
            />
            Wrap items in frame
          </label>
          {withFrame && (
            <input
              type="text"
              placeholder="Frame title"
              value={frameTitle}
              onChange={e => setFrameTitle(e.target.value)}
              style={{ marginTop: '4px', width: '100%' }}
            />
          )}

          <button
            onClick={handleCreate}
            className="button button-small button-primary"
          >
            {mode === 'diagram' ? 'Create Diagram' : 'Create Cards'}
          </button>
          {progress > 0 && progress < 100 && (
            <progress value={progress} max={100} style={{ width: '100%' }} />
          )}
          {preview && (
            <pre
              style={{ textAlign: 'left', maxHeight: 120, overflow: 'auto' }}
            >
              {preview}
            </pre>
          )}
          {error && <p className="error">{error}</p>}
          {lastProc && (
            <button
              onClick={() => {
                lastProc.undoLast();
                setLastProc(undefined);
              }}
              className="button button-small"
              style={{ marginTop: '8px' }}
            >
              Undo Last Import
            </button>
          )}
        </>
      )}
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
