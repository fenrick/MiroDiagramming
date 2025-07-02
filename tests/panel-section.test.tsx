/** @vitest-environment jsdom */
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Panel, Section } from '../src/ui/components';
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

  it('forwards attributes but ignores style', () => {
    const { getByTestId } = render(
      // @ts-expect-error style is intentionally unsupported
      <Panel
        data-testid='panel'
        style={{ background: 'red' }}
      />,
    );
    expect(getByTestId('panel')).not.toHaveStyle('background: red');
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

  it('forwards attributes but ignores style', () => {
    const { getByTestId } = render(
      // @ts-expect-error style is intentionally unsupported
      <Section
        data-testid='section'
        style={{ background: 'blue' }}
      />,
    );
    expect(getByTestId('section')).not.toHaveStyle('background: blue');
  });
});
