import React from 'react'
import { Button } from '@base-ui-components/react/button'
import { Checkbox } from '@base-ui-components/react/checkbox'
import { Field } from '@base-ui-components/react/field'

import { applyGridLayout, type GridOptions } from '../../board/grid-tools'
import { boardCache } from '../../board/board-cache'
import { applySpacingLayout, type SpacingOptions } from '../../board/spacing-tools'
import { applyBracketTagsToSelectedStickies } from '../../board/sticky-tags'
import { PageHelp } from '../components/page-help'
import { InfoCallout } from '../components/info-callout'
import { TabPanel } from '../components/tab-panel'
import { StickyActions } from '../sticky-actions'
import { useSelection } from '../hooks/use-selection'

export const ArrangeTabV2: React.FC = () => {
  const selection = useSelection()
  const hasSelection = selection.length > 0
  const [grid, setGrid] = React.useState<GridOptions>({
    cols: 2,
    padding: 20,
    groupResult: false,
    sortByName: false,
    sortOrientation: 'horizontal',
  })
  const [spacing, setSpacing] = React.useState<SpacingOptions>({
    axis: 'x',
    spacing: 20,
    mode: 'move',
  })
  const [frameTitle, setFrameTitle] = React.useState('')

  const updateCols = (value: string | number): void => {
    const numeric = typeof value === 'number' ? value : Number(value)
    setGrid((current) => ({ ...current, cols: numeric }))
  }

  const updatePadding = (value: string | number): void => {
    const numeric = typeof value === 'number' ? value : Number(value)
    setGrid((current) => ({ ...current, padding: numeric }))
  }

  const toggleSortByName = (): void => {
    setGrid((current) => ({ ...current, sortByName: !current.sortByName }))
  }

  const toggleGroupResult = (): void => {
    setGrid((current) => ({ ...current, groupResult: !current.groupResult }))
  }

  const applyGrid = React.useCallback((): void => {
    if (!hasSelection) return
    boardCache.clearSelection()
    void applyGridLayout({ ...grid, frameTitle })
  }, [frameTitle, grid, hasSelection])

  const applySpacing = React.useCallback((): void => {
    if (!hasSelection) return
    void applySpacingLayout(spacing)
  }, [hasSelection, spacing])

  const applyStickyTags = React.useCallback((): void => {
    if (!hasSelection) return
    void applyBracketTagsToSelectedStickies()
  }, [hasSelection])

  return (
    <TabPanel tabId="arrange">
      <div>
        <PageHelp content="Grid and spacing tools" />

        {!hasSelection && (
          <InfoCallout title="No selection">
            Select the widgets you want to arrange before running these tools.
          </InfoCallout>
        )}

        <section title="Grid">
          <Field.Root className="form-group form-group-small">
            <Field.Label>Columns</Field.Label>
            <Field.Control
              className="input input-small"
              type="number"
              value={grid.cols}
              onValueChange={updateCols}
            />
          </Field.Root>
          <Field.Root className="form-group form-group-small">
            <Field.Label>Gap</Field.Label>
            <Field.Control
              className="input input-small"
              type="number"
              value={grid.padding}
              onValueChange={updatePadding}
            />
          </Field.Root>
          <label className="inline-field form-group form-group-small">
            <Checkbox.Root
              checked={grid.sortByName}
              onCheckedChange={toggleSortByName}
              className="checkbox"
            >
              <Checkbox.Indicator>✓</Checkbox.Indicator>
            </Checkbox.Root>
            <span>Sort by name</span>
          </label>

          {grid.sortByName && (
            <Field.Root className="form-group form-group-small">
              <Field.Label>Fill direction</Field.Label>
              <Field.Control
                render={(properties) => (
                  <select
                    {...properties}
                    className="input input-small"
                    value={grid.sortOrientation}
                    onChange={(event) => {
                      const orientation = event.target.value as GridOptions['sortOrientation']
                      setGrid((current) => ({ ...current, sortOrientation: orientation }))
                    }}
                  >
                    <option value="horizontal">Across rows (left → right)</option>
                    <option value="vertical">Down columns (top → bottom)</option>
                  </select>
                )}
              />
            </Field.Root>
          )}

          <label className="inline-field form-group form-group-small">
            <Checkbox.Root
              checked={grid.groupResult}
              onCheckedChange={toggleGroupResult}
              className="checkbox"
            >
              <Checkbox.Indicator>✓</Checkbox.Indicator>
            </Checkbox.Root>
            <span>Group items into Frame</span>
          </label>

          {grid.groupResult && (
            <Field.Root className="form-group form-group-small">
              <Field.Label>Frame title</Field.Label>
              <Field.Control
                className="input input-small"
                value={frameTitle}
                onValueChange={(value) => {
                  setFrameTitle(value)
                }}
                placeholder="Optional"
              />
            </Field.Root>
          )}

          <StickyActions>
            <Button
              className="button button-primary button-medium"
              onClick={applyGrid}
              disabled={!hasSelection}
            >
              <span className="icon icon-tile" aria-hidden="true"></span>
              <p className="p-medium">Arrange Grid</p>
            </Button>
          </StickyActions>
        </section>

        <section title="Spacing">
          <Field.Root className="form-group form-group-small">
            <Field.Label>Axis</Field.Label>
            <Field.Control
              render={(properties) => (
                <select
                  {...properties}
                  className="input input-small"
                  value={spacing.axis}
                  onChange={(event) => {
                    const axis = event.target.value as SpacingOptions['axis']
                    setSpacing({ ...spacing, axis })
                  }}
                >
                  <option value="x">Horizontal</option>
                  <option value="y">Vertical</option>
                </select>
              )}
            />
          </Field.Root>
          <Field.Root className="form-group form-group-small">
            <Field.Label>Spacing</Field.Label>
            <Field.Control
              className="input input-small"
              type="number"
              value={spacing.spacing}
              onValueChange={(value) => {
                setSpacing({ ...spacing, spacing: Number(value) })
              }}
            />
          </Field.Root>
          <Field.Root className="form-group form-group-small">
            <Field.Label>Mode</Field.Label>
            <Field.Control
              render={(properties) => (
                <select
                  {...properties}
                  className="input input-small"
                  value={spacing.mode}
                  onChange={(event) => {
                    const mode = event.target.value as SpacingOptions['mode']
                    setSpacing({ ...spacing, mode })
                  }}
                >
                  <option value="move">Move items</option>
                  <option value="grow">Resize gaps</option>
                </select>
              )}
            />
          </Field.Root>
          <StickyActions>
            <Button
              className="button button-primary button-medium"
              onClick={applySpacing}
              disabled={!hasSelection}
            >
              <span className="icon icon-arrows-right" aria-hidden="true"></span>
              <p className="p-medium">Apply Spacing</p>
            </Button>
          </StickyActions>
        </section>

        <section title="Sticky helpers">
          <p>Add [bracket] tags around selected stickies.</p>
          <StickyActions>
            <Button
              className="button button-secondary button-medium"
              onClick={applyStickyTags}
              disabled={!hasSelection}
            >
              Add bracket tags
            </Button>
          </StickyActions>
        </section>
      </div>
    </TabPanel>
  )
}

export default ArrangeTabV2
