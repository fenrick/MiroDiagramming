import { Grid, IconChevronRightDouble, IconGrid, Text, Flex } from '@mirohq/design-system'
import { space } from '@mirohq/design-tokens'
import React from 'react'

import { applyGridLayout, type GridOptions } from '../../board/grid-tools'
import { boardCache } from '../../board/board-cache'
import { applySpacingLayout, type SpacingOptions } from '../../board/spacing-tools'
import {
  Button,
  ButtonToolbar,
  Checkbox,
  EmptyState,
  InputField,
  SelectField,
  SelectOption,
  SidebarSection,
  InfoCallout,
} from '../components'
import { PageHelp } from '../components/page-help'
import { TabPanel } from '../components/tab-panel'
import { StickyActions } from '../sticky-actions'
import { applyBracketTagsToSelectedStickies } from '../../board/sticky-tags'
import { useSelection } from '../hooks/use-selection'

import type { TabTuple } from './tab-definitions'

const CONTENT_STYLE: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: space[200],
}

export const ArrangeTab: React.FC = () => {
  const selection = useSelection()
  const hasSelection = selection.length > 0
  let selectionLabel = 'No selection'
  if (hasSelection) {
    const count = selection.length
    const noun = count === 1 ? 'item' : 'items'
    selectionLabel = `${count} selected ${noun}`
  }
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

  const updateNumber =
    (key: 'cols' | 'padding') =>
    (value: string): void =>
      setGrid({ ...grid, [key]: Number(value) })
  const toggle = (key: 'groupResult' | 'sortByName') => (): void =>
    setGrid({ ...grid, [key]: !grid[key] })
  const setOrientation = (value: string): void =>
    setGrid({ ...grid, sortOrientation: value as 'horizontal' | 'vertical' })
  const updateAxis = (axis: string): void => {
    if (axis === 'x' || axis === 'y') {
      setSpacing({ ...spacing, axis })
    }
  }
  const updateSpacing = (value: string): void => setSpacing({ ...spacing, spacing: Number(value) })
  const updateMode = (mode: string): void => {
    if (mode === 'move' || mode === 'grow') {
      setSpacing({ ...spacing, mode })
    }
  }
  const applyGrid = async (): Promise<void> => {
    if (!hasSelection) {
      return
    }
    boardCache.clearSelection()
    await applyGridLayout({ ...grid, frameTitle })
  }
  const applySpacing = async (): Promise<void> => {
    if (!hasSelection) {
      return
    }
    await applySpacingLayout(spacing)
  }
  const applyStickyTags = async (): Promise<void> => {
    if (!hasSelection) {
      return
    }
    await applyBracketTagsToSelectedStickies()
  }

  return (
    <TabPanel tabId="arrange">
      <div style={CONTENT_STYLE}>
        <PageHelp content="Grid and spacing tools" />
        {hasSelection ? null : (
          <EmptyState
            title="No selection"
            description="Select the widgets you want to arrange before running these tools."
          />
        )}
        <SidebarSection title="Grid">
          <Grid columns={2}>
            <Grid.Item>
              <InputField
                label="Columns"
                type="number"
                value={String(grid.cols)}
                onValueChange={(v) => updateNumber('cols')(v)}
                placeholder="Columns"
              />
            </Grid.Item>
            <Grid.Item>
              <InputField
                label="Gap"
                type="number"
                value={String(grid.padding)}
                onValueChange={(v) => updateNumber('padding')(v)}
                placeholder="Gap"
              />
            </Grid.Item>
            <Grid.Item>
              <Checkbox
                label="Sort by name"
                value={Boolean(grid.sortByName)}
                onChange={toggle('sortByName')}
              />
            </Grid.Item>
            {grid.sortByName && (
              <Grid.Item>
                <SelectField
                  label="Fill direction"
                  value={grid.sortOrientation}
                  onChange={setOrientation}
                >
                  <SelectOption value="horizontal">Across rows (left → right)</SelectOption>
                  <SelectOption value="vertical">Down columns (top → bottom)</SelectOption>
                </SelectField>
              </Grid.Item>
            )}
            <Grid.Item>
              <Checkbox
                label="Group items into Frame"
                value={Boolean(grid.groupResult)}
                onChange={toggle('groupResult')}
              />
            </Grid.Item>
            {grid.groupResult && (
              <Grid.Item>
                <InputField
                  label="Frame Title"
                  value={frameTitle}
                  onValueChange={(v) => setFrameTitle(v)}
                  placeholder="Optional"
                />
              </Grid.Item>
            )}
            <Grid.Item>
              <StickyActions>
                <ButtonToolbar>
                  <Button
                    onClick={applyGrid}
                    variant="primary"
                    iconPosition="start"
                    icon={<IconGrid />}
                    disabled={!hasSelection}
                  >
                    <Text>Arrange Grid</Text>
                  </Button>
                </ButtonToolbar>
              </StickyActions>
            </Grid.Item>
          </Grid>
          <div style={{ marginTop: space[100] }}>
            <InfoCallout title="Tip">
              {selectionLabel}. With 4 items and 3 columns: horizontal fill lays out 3 + 1; vertical
              fill lays out 2 + 2.
            </InfoCallout>
          </div>
        </SidebarSection>
        <SidebarSection title="Spacing">
          <div style={{ marginBottom: space[200] }}>
            <InfoCallout title="Mode">
              Move keeps sizes and shifts items; Expand increases gaps by growing groups along the
              chosen axis.
            </InfoCallout>
          </div>
          <Grid columns={2}>
            <Grid.Item>
              <Flex direction="column" gap={100} css={{ marginBottom: space[200] }}>
                <SelectField label="Axis" value={spacing.axis} onChange={updateAxis}>
                  <SelectOption value="x">Horizontal</SelectOption>
                  <SelectOption value="y">Vertical</SelectOption>
                </SelectField>
                <SelectField label="Mode" value={spacing.mode ?? 'move'} onChange={updateMode}>
                  <SelectOption value="move">Move</SelectOption>
                  <SelectOption value="grow">Expand</SelectOption>
                </SelectField>
                <InputField
                  label="Spacing"
                  type="number"
                  value={String(spacing.spacing)}
                  onValueChange={(v) => updateSpacing(v)}
                  placeholder="Distance"
                />
                <StickyActions>
                  <ButtonToolbar>
                    <Button
                      onClick={applySpacing}
                      variant="primary"
                      iconPosition="start"
                      icon={<IconChevronRightDouble />}
                      disabled={!hasSelection}
                    >
                      <Text>Distribute</Text>
                    </Button>
                  </ButtonToolbar>
                </StickyActions>
              </Flex>
            </Grid.Item>
            <Grid.Item>
              <StickyActions>
                <ButtonToolbar>
                  <Button onClick={applyStickyTags} variant="secondary" disabled={!hasSelection}>
                    <Text>Apply [tags] to Stickies</Text>
                  </Button>
                </ButtonToolbar>
              </StickyActions>
            </Grid.Item>
          </Grid>
        </SidebarSection>
      </div>
    </TabPanel>
  )
}
export const tabDefinition: TabTuple = [
  4,
  'arrange',
  'Arrange',
  'Grid and spacing tools',
  ArrangeTab,
]
