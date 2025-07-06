/** @vitest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TabPanel } from '../src/ui/components/TabPanel';

test('renders with correct aria attributes', () => {
  render(<TabPanel tabId='test'>Content</TabPanel>);
  const panel = screen.getByRole('tabpanel');
  expect(panel).toHaveAttribute('id', 'panel-test');
  expect(panel).toHaveAttribute('aria-labelledby', 'tab-test');
  expect(panel).toHaveTextContent('Content');
});

test('forwards props to div', () => {
  render(
    <TabPanel
      tabId='other'
      data-testid='panel'
      className='extra'
    />,
  );
  const div = screen.getByTestId('panel');
  expect(div).toHaveClass('extra');
});
