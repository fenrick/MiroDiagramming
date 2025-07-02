/** @vitest-environment jsdom */
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Panel, Section } from '../src/ui/components/legacy';
import { tokens } from '../src/ui/tokens';

describe('Panel', () => {
  it('applies default padding', () => {
    const { container } = render(<Panel>content</Panel>);
    expect(container.firstChild).toHaveStyle(`padding: ${tokens.space.medium}`);
  });

  it('supports padding tokens', () => {
    const { container } = render(<Panel padding='small'>content</Panel>);
    expect(container.firstChild).toHaveStyle(`padding: ${tokens.space.small}`);
  });
});

describe('Section', () => {
  it('applies default padding', () => {
    const { container } = render(<Section>content</Section>);
    expect(container.firstChild).toHaveStyle(`padding: ${tokens.space.small}`);
  });

  it('supports padding tokens', () => {
    const { container } = render(<Section padding='large'>content</Section>);
    expect(container.firstChild).toHaveStyle(`padding: ${tokens.space.large}`);
  });
});
