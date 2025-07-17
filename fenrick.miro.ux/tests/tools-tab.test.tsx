/** @vitest-environment jsdom */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ToolsTab } from '../src/ui/pages/ToolsTab';

vi.mock('@mirohq/design-system', async () => {
  const React = await import('react');
  const Tabs = ({
    children,
    onChange,
  }: {
    children: React.ReactNode;
    onChange?: (v: string) => void;
  }) => (
    <div>
      {React.Children.map(children, (child) =>
        React.cloneElement(child as React.ReactElement, { onChange }),
      )}
    </div>
  );
  Tabs.List = ({
    children,
    onChange,
  }: {
    children: React.ReactNode;
    onChange?: (v: string) => void;
  }) => (
    <div role='tablist'>
      {React.Children.map(children, (child) =>
        React.cloneElement(child as React.ReactElement, { onChange }),
      )}
    </div>
  );
  Tabs.Trigger = ({
    value,
    children,
    onChange,
  }: {
    value: string;
    children: React.ReactNode;
    onChange?: (v: string) => void;
  }) => (
    <button
      role='tab'
      onClick={() => onChange?.(value)}>
      {children}
    </button>
  );
  Tabs.displayName = 'TabsMock';
  Tabs.List.displayName = 'TabsListMock';
  Tabs.Trigger.displayName = 'TabsTriggerMock';
  const IconButton = ({
    children,
    ...props
  }: {
    children: React.ReactNode;
  }) => <button {...props}>{children}</button>;
  const IconQuestionMarkCircle = () => <svg data-testid='icon' />;
  const Tooltip = ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  );
  Tooltip.Provider = ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  );
  Tooltip.Trigger = ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  );
  Tooltip.Content = ({ children }: { children: React.ReactNode }) => (
    <div role='tooltip'>{children}</div>
  );
  Tooltip.Portal = ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  );
  IconButton.displayName = 'IconButtonMock';
  IconQuestionMarkCircle.displayName = 'IconQuestionMarkCircleMock';
  Tooltip.displayName = 'TooltipMock';
  Tooltip.Provider.displayName = 'TooltipProviderMock';
  Tooltip.Trigger.displayName = 'TooltipTriggerMock';
  Tooltip.Content.displayName = 'TooltipContentMock';
  Tooltip.Portal.displayName = 'TooltipPortalMock';
  return { Tabs, IconButton, IconQuestionMarkCircle, Tooltip };
});

vi.mock('../src/ui/pages/ResizeTab', () => {
  const ResizeTabMock: React.FC = () => (
    <div data-testid='resize-tab'>Resize</div>
  );
  return { ResizeTab: ResizeTabMock };
});
vi.mock('../src/ui/pages/StyleTab', () => {
  const StyleTabMock: React.FC = () => <div data-testid='style-tab'>Style</div>;
  return { StyleTab: StyleTabMock };
});
vi.mock('../src/ui/pages/ArrangeTab', () => {
  const ArrangeTabMock: React.FC = () => (
    <div data-testid='arrange-tab'>Arrange</div>
  );
  return { ArrangeTab: ArrangeTabMock };
});
vi.mock('../src/ui/pages/FramesTab', () => {
  const FramesTabMock: React.FC = () => (
    <div data-testid='frames-tab'>Frames</div>
  );
  return { FramesTab: FramesTabMock };
});

describe('ToolsTab', () => {
  test('sub-tab switching renders correct panel', () => {
    render(<ToolsTab />);
    expect(screen.getByTestId('resize-tab')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Arrange' }));
    expect(screen.getByTestId('arrange-tab')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Colours' }));
    expect(screen.getByTestId('style-tab')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Frames' }));
    expect(screen.getByTestId('frames-tab')).toBeInTheDocument();
  });
});
