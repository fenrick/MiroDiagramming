import { Grid, IconChevronRightDouble, IconGrid, Text, Flex } from '@mirohq/design-system'
import React from 'react'

import { applyGridLayout, GridOptions } from '../../board/grid-tools'
import { boardCache } from '../../board/board-cache'
import { applySpacingLayout, SpacingOptions } from '../../board/spacing-tools'
import {
  Button,
  ButtonToolbar,
  Checkbox,
  InputField,
  SelectField,
  SelectOption,
  SidebarSection,
  InfoCallout,
} from '../components'
import { PageHelp } from '../components/PageHelp'
import { TabPanel } from '../components/TabPanel'
import { StickyActions } from '../StickyActions'
import { applyBracketTagsToSelectedStickies } from '../../board/sticky-tags'

import type { TabTuple } from './tab-definitions'

/**
 * Combines grid and spacing tools into a single sidebar tab.
 */
export const ArrangeTab: React.FC = () => {
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
    // Ensure we read a fresh selection before arranging
    boardCache.clearSelection()
    await applyGridLayout({ ...grid, frameTitle })
  }
  const applySpacing = async (): Promise<void> => await applySpacingLayout(spacing)
  const applyStickyTags = async (): Promise<void> => await applyBracketTagsToSelectedStickies()

  return (
    <TabPanel tabId="arrange">
      <PageHelp content="Grid and spacing tools" />
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
                >
                  <Text>Arrange Grid</Text>
                </Button>
              </ButtonToolbar>
            </StickyActions>
          </Grid.Item>
        </Grid>
        <div style={{ marginTop: 'var(--space-100)' }}>
          <InfoCallout title="Tip">
            With 4 items and 3 columns: horizontal fill lays out 3 + 1; vertical fill lays out 2 +
            2. Vertical fill places items top-to-bottom in each column before moving to the next.
          </InfoCallout>
        </div>
      </SidebarSection>
      <SidebarSection title="Spacing">
        <div style={{ marginBottom: 'var(--space-200)' }}>
          <InfoCallout title="Mode">
            Move keeps sizes and shifts items; Expand increases gaps by growing groups along the
            chosen axis.
          </InfoCallout>
        </div>
        <Grid columns={2}>
          <Grid.Item>
            <Flex direction="column" gap={100} css={{ marginBottom: 'var(--space-200)' }}>
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
                <Button onClick={applyStickyTags} variant="secondary">
                  <Text>Apply [tags] to Stickies</Text>
                </Button>
              </ButtonToolbar>
            </StickyActions>
          </Grid.Item>
        </Grid>
      </SidebarSection>
    </TabPanel>
  )
}

export const tabDef: TabTuple = [4, 'arrange', 'Arrange', 'Grid and spacing tools', ArrangeTab]
