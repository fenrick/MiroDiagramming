import React from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Button,
  Checkbox,
  Input,
  InputLabel,
  Paragraph,
  tokens,
  Text,
  Icon,
} from 'mirotone-react';
import { CardProcessor } from '../../board/CardProcessor';
import { cardLoader, CardData } from '../../core/cards';
import { showError } from '../notifications';
import { getDropzoneStyle, undoLastImport } from '../ui-utils';

/** UI for the Cards tab. */
export const CardsTab: React.FC = () => {
  const [files, setFiles] = React.useState<File[]>([]);
  const [cards, setCards] = React.useState<CardData[]>([]);
  const [cardSearch, setCardSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [cardFilters, setCardFilters] = React.useState<string[]>([]);
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
        void undoLastImport(lastProc, () => setLastProc(undefined));
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lastProc]);

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(cardSearch), 300);
    return () => clearTimeout(t);
  }, [cardSearch]);

  const dropzone = useDropzone({
    accept: {
      'application/json': ['.json'],
    },
    maxFiles: 1,
    onDrop: async (droppedFiles: File[]) => {
      const file = droppedFiles[0];
      setFiles([file]);
      try {
        const data = await cardLoader.loadCards(file);
        setCards(data);
      } catch (e) {
        setError(String(e));
      }
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

  const style = React.useMemo(
    () => getDropzoneStyle(dropzone.isDragAccept, dropzone.isDragReject),
    [dropzone.isDragAccept, dropzone.isDragReject],
  );

  const allTags = React.useMemo(() => {
    const t = new Set<string>();
    cards.forEach(c => c.tags?.forEach(tag => t.add(tag)));
    return Array.from(t);
  }, [cards]);

  const filteredCards = React.useMemo(
    () =>
      cards.filter(c => {
        const matchesSearch = c.title
          .toLowerCase()
          .includes(debouncedSearch.toLowerCase());
        const tagMatch =
          cardFilters.length === 0 ||
          c.tags?.some(t => cardFilters.includes(t));
        return matchesSearch && tagMatch;
      }),
    [cards, debouncedSearch, cardFilters],
  );

  return (
    <div>
      <Paragraph>Select the JSON file to import a list of cards</Paragraph>
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
      <Paragraph id='dropzone-instructions' className='custom-visually-hidden'>
        Press Enter to open the file picker or drop a JSON file on the area
        above.
      </Paragraph>

      {files.length > 0 && (
        <>
          <ul className='custom-dropped-files'>
            {files.map((file, i) => (
              <li key={i}>{file.name}</li>
            ))}
          </ul>
          <Input
            placeholder='Search cards…'
            value={cardSearch}
            onChange={setCardSearch}
          />
          <div>
            {allTags.map(tag => (
              <Checkbox
                key={tag}
                label={tag}
                value={cardFilters.includes(tag)}
                onChange={() =>
                  setCardFilters(f =>
                    f.includes(tag) ? f.filter(t => t !== tag) : [...f, tag],
                  )
                }
              />
            ))}
          </div>
          <ul>
            {filteredCards.map((c, i) => (
              <li key={i}>{c.title}</li>
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
          <Button onClick={handleCreate} size='small' variant='primary'>
            <React.Fragment key='.0'>
              <Icon name='plus' />
              <Text>Create Cards</Text>
            </React.Fragment>
          </Button>
          {progress > 0 && progress < 100 && (
            <progress value={progress} max={100} />
          )}
          {error && <Paragraph className='error'>{error}</Paragraph>}
          {showUndo && (
            <Button
              onClick={() =>
                void undoLastImport(lastProc, () => setLastProc(undefined))
              }
              size='small'
              variant='secondary'
            >
              Undo import (⌘Z)
            </Button>
          )}
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
