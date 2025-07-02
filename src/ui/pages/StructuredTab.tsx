import React from 'react';
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
import { JsonDropZone } from '../components/JsonDropZone';
import { tokens } from '../tokens';
import { TabGrid } from '../components/TabGrid';
import { Panel } from '../components/legacy';
import { GraphProcessor } from '../../core/graph/graph-processor';
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
import { undoLastImport } from '../hooks/ui-utils';
import {
  useDiagramCreate,
  useAdvancedToggle,
  LayoutChoice,
} from '../hooks/use-diagram-create';

/**
 * Queue the first file from a drop event for import.
 *
 * @param droppedFiles - Files received from the drop zone.
 * @param setImportQueue - Setter storing files for processing.
 * @param setError - Setter clearing any previous error state.
 */
function handleFileDrop(
  droppedFiles: File[],
  setImportQueue: React.Dispatch<React.SetStateAction<File[]>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
): void {
  const file = droppedFiles[0];
  setImportQueue([file]);
  setError(null);
}

const LAYOUTS = [
  'Layered',
  'Tree',
  'Grid',
  'Nested',
  'Radial',
  'Box',
  'Rect Packing',
] as const;

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

/** Descriptions for layout choices shown inline when importing graphs. */
const LAYOUT_DESCRIPTIONS: Record<LayoutChoice, string> = {
  'Layered': 'Flow diagrams with layers',
  'Tree': 'Compact hierarchical tree',
  'Grid': 'Organic force-directed grid',
  'Nested': 'Containers sized to fit children',
  'Radial': 'Circular layout around a hub',
  'Box': 'Uniform box grid',
  'Rect Packing': 'Fits rectangles within parents',
};

/** UI for the Structured sub-tab. */
// eslint-disable-next-line complexity
export const StructuredTab: React.FC = () => {
  const [importQueue, setImportQueue] = React.useState<File[]>([]);
  const [layoutChoice, setLayoutChoice] =
    React.useState<LayoutChoice>('Layered');
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [withFrame, setWithFrame] = React.useState(false);
  const [frameTitle, setFrameTitle] = React.useState('');
  const [layoutOpts, setLayoutOpts] = React.useState<UserLayoutOptions>(
    DEFAULT_LAYOUT_OPTIONS,
  );
  const [nestedPadding, setNestedPadding] = React.useState(20);
  const [nestedTopSpacing, setNestedTopSpacing] = React.useState(50);
  const [progress, setProgress] = React.useState<number>(0);
  const [error, setError] = React.useState<string | null>(null);
  const [lastProc, setLastProc] = React.useState<
    GraphProcessor | HierarchyProcessor | undefined
  >(undefined);

  useAdvancedToggle(setShowAdvanced);

  const handleFiles = React.useCallback((droppedFiles: File[]): void => {
    handleFileDrop(droppedFiles, setImportQueue, setError);
  }, []);

  const handleCreate = useDiagramCreate(
    importQueue,
    {
      layoutChoice,
      showAdvanced,
      withFrame,
      frameTitle,
      layoutOpts,
      nestedPadding,
      nestedTopSpacing,
    },
    setImportQueue,
    setProgress,
    setError,
    setLastProc,
  );

  return (
    <div
      id='panel-diagram'
      role='tabpanel'
      aria-labelledby='tab-diagram'
      style={{ marginTop: tokens.space.small }}>
      <Panel padding='small'>
        <JsonDropZone onFiles={handleFiles} />

        {importQueue.length > 0 && (
          <TabGrid columns={2}>
            <ul className='custom-dropped-files'>
              {importQueue.map((file) => (
                <li key={`${file.name}-${file.lastModified}`}>{file.name}</li>
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
            <Paragraph className='field-help'>Layout options:</Paragraph>
            <ul className='field-help'>
              {LAYOUTS.map((l) => (
                <li key={`desc-${l}`}>{LAYOUT_DESCRIPTIONS[l]}</li>
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
              {layoutChoice === 'Nested' && (
                <InputField label='Padding'>
                  <input
                    className='input'
                    type='number'
                    value={String(nestedPadding)}
                    onChange={(e) => setNestedPadding(Number(e.target.value))}
                  />
                </InputField>
              )}
              {layoutChoice === 'Nested' && (
                <InputField label='Top spacing'>
                  <input
                    className='input'
                    type='number'
                    value={String(nestedTopSpacing)}
                    onChange={(e) =>
                      setNestedTopSpacing(Number(e.target.value))
                    }
                  />
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
          </TabGrid>
        )}
      </Panel>
    </div>
  );
};
