import React from 'react';
import {
  Button,
  Checkbox,
  InputField,
  Paragraph,
  Text,
  Icon,
} from '../components/legacy';
import { JsonDropZone } from '../components/JsonDropZone';
import { tokens } from '../tokens';
import { CardProcessor } from '../../board/card-processor';

import { showError } from '../hooks/notifications';
import { undoLastImport } from '../hooks/ui-utils';

/** UI for the Cards tab. */
export const CardsTab: React.FC = () => {
  const [files, setFiles] = React.useState<File[]>([]);
  const [showUndo, setShowUndo] = React.useState(false);
  const [withFrame, setWithFrame] = React.useState(false);
  const [frameTitle, setFrameTitle] = React.useState('');
  const [progress, setProgress] = React.useState<number>(0);
  const [error, setError] = React.useState<string | null>(null);
  const [lastProc, setLastProc] = React.useState<CardProcessor | undefined>(
    undefined,
  );

  React.useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undoLastImport(lastProc, () => setLastProc(undefined));
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lastProc]);

  const handleFiles = (droppedFiles: File[]): void => {
    const file = droppedFiles[0];
    setFiles([file]);
  };

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
        setShowUndo(true);
        setTimeout(() => setShowUndo(false), 3000);
      } catch (e) {
        const msg = String(e);
        setError(msg);
        await showError(msg);
      }
    }
    setFiles([]);
  };

  return (
    <div
      id='panel-cards'
      role='tabpanel'
      aria-labelledby='tab-cards'
      style={{ marginTop: tokens.space.small }}>
      <JsonDropZone onFiles={handleFiles} />

      {files.length > 0 && (
        <>
          <ul className='custom-dropped-files'>
            {files.map((file) => (
              <li key={`${file.name}-${file.lastModified}`}>{file.name}</li>
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
            <InputField label='Frame title'>
              <input
                className='input'
                placeholder='Frame title'
                value={frameTitle}
                onChange={(e) => setFrameTitle(e.target.value)}
              />
            </InputField>
          )}
          <div className='buttons'>
            <Button
              onClick={handleCreate}
              variant='primary'>
              <React.Fragment key='.0'>
                <Icon name='plus' />
                <Text>Create Cards</Text>
              </React.Fragment>
            </Button>
            {progress > 0 && progress < 100 && (
              <progress
                value={progress}
                max={100}
              />
            )}
            {error && <Paragraph className='error'>{error}</Paragraph>}
            {showUndo && (
              <Button
                onClick={() =>
                  undoLastImport(lastProc, () => setLastProc(undefined))
                }
                variant='secondary'>
                Undo import (⌘Z)
              </Button>
            )}
            {lastProc && (
              <Button
                onClick={() => {
                  undoLastImport(lastProc, () => setLastProc(undefined));
                }}
                variant='secondary'>
                <React.Fragment key='.0'>
                  <Icon name='undo' />
                  <Text>Undo Last Import</Text>
                </React.Fragment>
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
};
