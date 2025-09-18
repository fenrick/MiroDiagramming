import type { Meta, StoryObj } from '@storybook/react'

import { FilterDropdown } from '../ui/components/FilterDropdown'

const meta: Meta<typeof FilterDropdown> = {
  title: 'Components/FilterDropdown',
  component: FilterDropdown,
}
export default meta

type Story = StoryObj<typeof FilterDropdown>

export const Default: Story = {
  args: {
    widgetTypes: [],
    toggleType: () => {},
    tagIds: '',
    onTagIdsChange: () => {},
    backgroundColor: '',
    onBackgroundColorChange: () => {},
    assignee: '',
    onAssigneeChange: () => {},
    creator: '',
    onCreatorChange: () => {},
    lastModifiedBy: '',
    onLastModifiedByChange: () => {},
    caseSensitive: false,
    onCaseSensitiveChange: () => {},
    wholeWord: false,
    onWholeWordChange: () => {},
  },
}
