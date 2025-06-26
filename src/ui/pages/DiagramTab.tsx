import React from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Button,
  Checkbox,
  Icon,
  InputField,
  Paragraph,
  Select,
  SelectOption,
  Text,
} from '../components/legacy';
import { tokens } from '../tokens';
import { GraphProcessor } from '../../core/graph/graph-processor';
import { showError } from '../hooks/notifications';
import {
  ALGORITHMS,
  DEFAULT_LAYOUT_OPTIONS,
  DIRECTIONS,
  EDGE_ROUTINGS,
  EDGE_ROUTING_MODES,
  OPTIMIZATION_GOALS,
  ElkAlgorithm,
  ElkDirection,
  ElkEdgeRouting,
  ElkEdgeRoutingMode,
  ElkOptimizationGoal,
  UserLayoutOptions,
} from '../../core/layout/elk-options';
import { HierarchyProcessor } from '../../core/graph/hierarchy-processor';
import { getDropzoneStyle, undoLastImport } from '../hooks/ui-utils';

const LAYOUTS = ['Layered', 'Tree', 'Grid', 'Nested'] as const;
type LayoutChoice = (typeof LAYOUTS)[number];

const OPTION_VISIBILITY: Record<
  ElkAlgorithm,
  {
    aspectRatio: boolean;
    edgeRouting?: boolean;
    edgeRoutingMode?: boolean;
    optimizationGoal?: boolean;
  }
> = {
  layered: { aspectRatio: true, edgeRouting: true },
  mrtree: { aspectRatio: true, edgeRoutingMode: true },
  force: { aspectRatio: true },
  rectpacking: { aspectRatio: true, optimizationGoal: true },
  rectstacking: { aspectRatio: true },
  box: { aspectRatio: true },
  radial: { aspectRatio: true },
};

/** UI for the Diagram tab. */
export const DiagramTab: React.FC = () => {
  const [importQueue, setImportQueue] = React.useState<File[]>([]);
  const [layoutChoice, setLayoutChoice] =
    React.useState<LayoutChoice>('Layered');
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [withFrame, setWithFrame] = React.useState(false);
  const [frameTitle, setFrameTitle] = React.useState('');
  const [layoutOpts, setLayoutOpts] = React.useState<UserLayoutOptions>(
    DEFAULT_LAYOUT_OPTIONS,
  );
  const [progress, setProgress] = React.useState<number>(0);
  const [error, setError] = React.useState<string | null>(null);
  const [lastProc, setLastProc] = React.useState<
    GraphProcessor | HierarchyProcessor | undefined
  >(undefined);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setShowAdvanced((v) => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const dropzone = useDropzone({
    accept: { 'application/json': ['.json'] },
    maxFiles: 1,
    onDrop: async (droppedFiles: File[]) => {
      const file = droppedFiles[0];
      setImportQueue([file]);
      setError(null);
    },
  });

  const graphProcessor = React.useMemo(() => new GraphProcessor(), []);
  const hierarchyProcessor = React.useMemo(() => new HierarchyProcessor(), []);

  const handleCreate = async (): Promise<void> => {
    setProgress(0);
    setError(null);
    for (const file of importQueue) {
      try {
        if (layoutChoice === 'Nested') {
          setLastProc(hierarchyProcessor);
          await hierarchyProcessor.processFile(file, {
            createFrame: withFrame,
            frameTitle: frameTitle || undefined,
          });
        } else {
          setLastProc(graphProcessor);
          const algorithmMap: Record<LayoutChoice, ElkAlgorithm> = {
            Layered: 'layered',
            Tree: 'mrtree',
            Grid: 'force',
            Nested: 'layered',
          };
          const selectedAlg = showAdvanced
            ? layoutOpts.algorithm
            : algorithmMap[layoutChoice];
          await graphProcessor.processFile(file, {
            createFrame: withFrame,
            frameTitle: frameTitle || undefined,
            layout: { ...layoutOpts, algorithm: selectedAlg },
          });
        }
        setProgress(100);
      } catch (e) {
        const msg = String(e);
        setError(msg);
        await showError(msg);
      }
    }
    setImportQueue([]);
  };

  const style = React.useMemo(
    () => getDropzoneStyle(dropzone.isDragAccept, dropzone.isDragReject),
    [dropzone.isDragAccept, dropzone.isDragReject],
  );

  return (
    <div style={{ marginTop: tokens.space.small }}>
      <div
        {...dropzone.getRootProps({ style })}
        aria-label='File drop area'
        aria-describedby='dropzone-instructions'>
        <InputField label='JSON file'>
          <input
            data-testid='file-input'
            {...dropzone.getInputProps({ 'aria-label': 'JSON file input' })}
          />
        </InputField>
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
      <Paragraph
        id='dropzone-instructions'
        className='custom-visually-hidden'>
        Press Enter to open the file picker or drop a JSON file on the area
        above.
      </Paragraph>

      {importQueue.length > 0 && (
        <>
          <ul className='custom-dropped-files'>
            {importQueue.map((file, i) => (
              <li key={i}>{file.name}</li>
            ))}
          </ul>
          <InputField label='Layout type'>
            <Select
              value={layoutChoice}
              onChange={(value) => setLayoutChoice(value as LayoutChoice)}>
              {LAYOUTS.map((l) => (
                <SelectOption
                  key={l}
                  value={l}>
                  {l}
                </SelectOption>
              ))}
            </Select>
          </InputField>
          <Paragraph className='field-help'>
            See{' '}
            <a
              href='docs/LAYOUT_OPTIONS.md'
              target='_blank'
              rel='noopener noreferrer'>
              layout algorithm guide
            </a>
            .
          </Paragraph>
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
          <details
            open={showAdvanced}
            aria-label='Advanced options'
            onToggle={(e) =>
              setShowAdvanced((e.target as HTMLDetailsElement).open)
            }>
            <summary>Advanced options</summary>
            <InputField label='Algorithm'>
              <Select
                value={layoutOpts.algorithm}
                onChange={(value) =>
                  setLayoutOpts({
                    ...layoutOpts,
                    algorithm: value as ElkAlgorithm,
                  })
                }>
                {ALGORITHMS.map((a) => (
                  <SelectOption
                    key={a}
                    value={a}>
                    {a}
                  </SelectOption>
                ))}
              </Select>
            </InputField>
            <InputField label='Direction'>
              <Select
                value={layoutOpts.direction}
                onChange={(value) =>
                  setLayoutOpts({
                    ...layoutOpts,
                    direction: value as ElkDirection,
                  })
                }>
                {DIRECTIONS.map((d) => (
                  <SelectOption
                    key={d}
                    value={d}>
                    {d}
                  </SelectOption>
                ))}
              </Select>
            </InputField>
            <InputField label='Spacing'>
              <input
                className='input'
                type='number'
                value={String(layoutOpts.spacing)}
                onChange={(e) =>
                  setLayoutOpts({
                    ...layoutOpts,
                    spacing: Number(e.target.value),
                  })
                }
              />
            </InputField>
            {OPTION_VISIBILITY[layoutOpts.algorithm].aspectRatio && (
              <InputField label='Aspect ratio'>
                <input
                  className='input'
                  type='number'
                  step='0.1'
                  value={String(layoutOpts.aspectRatio)}
                  onChange={(e) =>
                    setLayoutOpts({
                      ...layoutOpts,
                      aspectRatio: Number(e.target.value),
                    })
                  }
                />
              </InputField>
            )}
            {OPTION_VISIBILITY[layoutOpts.algorithm].edgeRouting && (
              <InputField label='Edge routing'>
                <Select
                  value={layoutOpts.edgeRouting as ElkEdgeRouting}
                  onChange={(value) =>
                    setLayoutOpts({
                      ...layoutOpts,
                      edgeRouting: value as ElkEdgeRouting,
                    })
                  }>
                  {EDGE_ROUTINGS.map((e) => (
                    <SelectOption
                      key={e}
                      value={e}>
                      {e}
                    </SelectOption>
                  ))}
                </Select>
              </InputField>
            )}
            {OPTION_VISIBILITY[layoutOpts.algorithm].edgeRoutingMode && (
              <InputField label='Routing mode'>
                <Select
                  value={layoutOpts.edgeRoutingMode as ElkEdgeRoutingMode}
                  onChange={(value) =>
                    setLayoutOpts({
                      ...layoutOpts,
                      edgeRoutingMode: value as ElkEdgeRoutingMode,
                    })
                  }>
                  {EDGE_ROUTING_MODES.map((m) => (
                    <SelectOption
                      key={m}
                      value={m}>
                      {m}
                    </SelectOption>
                  ))}
                </Select>
              </InputField>
            )}
            {OPTION_VISIBILITY[layoutOpts.algorithm].optimizationGoal && (
              <InputField label='Optimisation goal'>
                <Select
                  value={layoutOpts.optimizationGoal as ElkOptimizationGoal}
                  onChange={(value) =>
                    setLayoutOpts({
                      ...layoutOpts,
                      optimizationGoal: value as ElkOptimizationGoal,
                    })
                  }>
                  {OPTIMIZATION_GOALS.map((o) => (
                    <SelectOption
                      key={o}
                      value={o}>
                      {o}
                    </SelectOption>
                  ))}
                </Select>
              </InputField>
            )}
          </details>
          <div className='buttons'>
            <Button
              onClick={handleCreate}
              variant='primary'>
              <React.Fragment key='.0'>
                <Icon name='plus' />
                <Text>Create Diagram</Text>
              </React.Fragment>
            </Button>
            {progress > 0 && progress < 100 && (
              <progress
                value={progress}
                max={100}
              />
            )}
            {error && <Paragraph className='error'>{error}</Paragraph>}
            {lastProc && (
              <Button
                onClick={() => {
                  void undoLastImport(lastProc, () => setLastProc(undefined));
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
