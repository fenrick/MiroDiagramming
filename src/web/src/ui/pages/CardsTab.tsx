import { Grid, IconArrowArcLeft, IconPlus, Text } from '@mirohq/design-system';
import React from 'react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { CardProcessor } from '../../board/card-processor';
import {
  Button,
  ButtonToolbar,
  Checkbox,
  DroppedFileList,
  InputField,
} from '../components';
import { StickyActions } from '../StickyActions';
import { JsonDropZone } from '../components/JsonDropZone';
import { PageHelp } from '../components/PageHelp';
import { TabPanel } from '../components/TabPanel';

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
    <TabPanel tabId='cards'>
      <PageHelp content='Board-linked items with thumbnail and title' />
      <JsonDropZone onFiles={handleFiles} />

      {files.length > 0 && (
        <Grid columns={2}>
          <Grid.Item>
            <DroppedFileList>
              {files.map(file => (
                <li key={`${file.name}-${file.lastModified}`}>{file.name}</li>
              ))}
            </DroppedFileList>
          </Grid.Item>
          <Grid.Item>
            <fieldset>
              <VisuallyHidden asChild>
                <legend>Card options</legend>
              </VisuallyHidden>
              <Checkbox
                label='Wrap items in frame'
                value={withFrame}
                onChange={setWithFrame}
              />
              {withFrame && (
                <InputField
                  label='Frame title'
                  value={frameTitle}
                  onValueChange={v => setFrameTitle(v)}
                  placeholder='Frame title'
                />
              )}
            </fieldset>
          </Grid.Item>
          <Grid.Item>
            <StickyActions>
              <ButtonToolbar>
                <Button
                  onClick={handleCreate}
                  variant='primary'
                  icon={<IconPlus />}
                  iconPosition='start'>
                  <Text>Create Cards</Text>
                </Button>
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
                    onClick={() =>
                      undoLastImport(lastProc, () => setLastProc(undefined))
                    }
                    variant='secondary'
                    iconPosition='start'
                    icon={<IconArrowArcLeft />}>
                    <Text>Undo Last Import</Text>
                  </Button>
                )}
              </ButtonToolbar>
            </StickyActions>
            {progress > 0 && progress < 100 && (
              <progress
                value={progress}
                max={100}
              />
            )}
            {error && <p className='error'>{error}</p>}
          </Grid.Item>
        </Grid>
      )}
    </TabPanel>
  );
};
