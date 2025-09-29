import type { Meta, StoryObj } from '@storybook/react'

import { FilterDropdown } from '../ui/components/filter-dropdown'

const meta: Meta<typeof FilterDropdown> = {
  title: 'Components/FilterDropdown',
  component: FilterDropdown,
}
export default meta

type Story = StoryObj<typeof FilterDropdown>

export const Default: Story = {
  args: {
    widgetTypes: [],
    toggleType: () => {
      console.log('toggleType')
    },
    tagIds: '',
    onTagIdsChange: (v: string) => {
      console.log('onTagIdsChange', v)
    },
    backgroundColor: '',
    onBackgroundColorChange: (v: string) => {
      console.log('onBackgroundColorChange', v)
    },
    assignee: '',
    onAssigneeChange: (v: string) => {
      console.log('onAssigneeChange', v)
    },
    creator: '',
    onCreatorChange: (v: string) => {
      console.log('onCreatorChange', v)
    },
    lastModifiedBy: '',
    onLastModifiedByChange: (v: string) => {
      console.log('onLastModifiedByChange', v)
    },
    caseSensitive: false,
    onCaseSensitiveChange: (v: boolean) => {
      console.log('onCaseSensitiveChange', v)
    },
    wholeWord: false,
    onWholeWordChange: (v: boolean) => {
      console.log('onWholeWordChange', v)
    },
  },
}
