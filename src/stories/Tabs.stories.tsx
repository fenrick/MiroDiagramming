import type { Meta, StoryObj } from '@storybook/react';
import { ArrangeTab } from '../ui/pages/ArrangeTab';
import { CardsTab } from '../ui/pages/CardsTab';
import { SearchTab } from '../ui/pages/SearchTab';

const meta: Meta = {
  title: 'Pages/Tabs',
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj;

export const Arrange: Story = { render: () => <ArrangeTab /> };
export const Cards: Story = { render: () => <CardsTab /> };
export const Search: Story = { render: () => <SearchTab /> };
