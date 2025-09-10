/** @vitest-environment jsdom */
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { PanelShell } from '../src/ui/PanelShell';

describe('PanelShell', () => {
  it('applies panel width and padding', () => {
    const { container } = render(
      <PanelShell>
        <div>content</div>
      </PanelShell>,
    );
    const wrapper = container.firstChild as HTMLDivElement;
    expect(wrapper).toHaveStyle({
      boxSizing: 'border-box',
      maxWidth: '320px',
      paddingLeft: '24px',
      paddingRight: '24px',
      margin: '0 auto',
    });
  });
});
