/** @vitest-environment jsdom */
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TabGrid } from '../src/ui/components/TabGrid';

it('applies grid class and item column classes', () => {
  const { container } = render(
    <TabGrid columns={1}>
      <span>A</span>
      <span>B</span>
    </TabGrid>,
  );
  const el = container.firstChild as HTMLElement;
  expect(el).toHaveClass('grid');
  const items = el.children;
  expect(items[0]).toHaveClass('cs1', 'ce12');
  expect(items[1]).toHaveClass('cs1', 'ce12');
});

it('uses two columns by default', () => {
  const { container } = render(
    <TabGrid>
      <span>A</span>
      <span>B</span>
    </TabGrid>,
  );
  const el = container.firstChild as HTMLElement;
  const items = el.children;
  expect(items[0]).toHaveClass('cs1', 'ce6');
  expect(items[1]).toHaveClass('cs7', 'ce12');
});
