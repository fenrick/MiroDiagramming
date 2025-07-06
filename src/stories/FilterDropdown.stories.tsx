import type { Meta, StoryObj } from '@storybook/react';
import { FilterDropdown } from '../ui/components/FilterDropdown';

const meta: Meta<typeof FilterDropdown> = {
  title: 'Components/FilterDropdown',
  component: FilterDropdown,
};
export default meta;

type Story = StoryObj<typeof FilterDropdown>;

export const Default: Story = {
  args: {
    widgetTypes: [],
    toggleType: (t: string) => console.log('toggle', t),
    tagIds: '',
    onTagIdsChange: (v: string) => console.log(v),
    backgroundColor: '',
    onBackgroundColorChange: (v: string) => console.log(v),
    assignee: '',
    onAssigneeChange: (v: string) => console.log(v),
    creator: '',
    onCreatorChange: (v: string) => console.log(v),
    lastModifiedBy: '',
    onLastModifiedByChange: (v: string) => console.log(v),
    caseSensitive: false,
    onCaseSensitiveChange: (v: boolean) => console.log(v),
    wholeWord: false,
    onWholeWordChange: (v: boolean) => console.log(v),
  },
};
