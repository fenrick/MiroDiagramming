/** @vitest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ResizeTab } from '../src/ui/pages/ResizeTab';
import { StyleTab } from '../src/ui/pages/StyleTab';
import { GridTab } from '../src/ui/pages/GridTab';
import { SpacingTab } from '../src/ui/pages/SpacingTab';
import { DiagramTab } from '../src/ui/pages/DiagramTab';
import { CardsTab } from '../src/ui/pages/CardsTab';
import * as resizeTools from '../src/board/resize-tools';
import * as styleTools from '../src/board/style-tools';
import * as gridTools from '../src/board/grid-tools';
import * as spacingTools from '../src/board/spacing-tools';
import { GraphProcessor } from '../src/core/graph/GraphProcessor';
import { CardProcessor } from '../src/board/CardProcessor';

vi.mock('../src/board/resize-tools');
vi.mock('../src/board/style-tools', async () => {
  const actual: typeof import('../src/board/style-tools') =
    await vi.importActual('../src/board/style-tools');
  return { ...actual, tweakFillColor: jest.fn() };
});
vi.mock('../src/board/grid-tools');
vi.mock('../src/board/spacing-tools');
vi.mock('../src/core/graph/GraphProcessor');
vi.mock('../src/board/CardProcessor');

describe('tab components', () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).miro = {
      board: {
        getSelection: jest.fn().mockResolvedValue([]),
        ui: { on: jest.fn() },
      },
    };
  });

  afterEach(() => {
    // cleanup global
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalThis as any).miro;
    jest.clearAllMocks();
  });
  test('ResizeTab applies size', async () => {
    const spy = jest
      .spyOn(resizeTools, 'applySizeToSelection')
      .mockResolvedValue(undefined as unknown as void);
    render(React.createElement(ResizeTab));
    fireEvent.change(screen.getByPlaceholderText(/width/i), {
      target: { value: '50' },
    });
    fireEvent.change(screen.getByPlaceholderText(/height/i), {
      target: { value: '40' },
    });
    await act(async () => {
      fireEvent.click(screen.getByText(/apply size/i));
    });
    expect(spy).toHaveBeenCalledWith({ width: 50, height: 40 });
  });

  test('ResizeTab toggles copy and reset', async () => {
    jest
      .spyOn(resizeTools, 'copySizeFromSelection')
      .mockResolvedValue({ width: 20, height: 30 });
    render(React.createElement(ResizeTab));
    await act(async () => {
      fireEvent.click(screen.getByText(/copy size/i));
    });
    expect(screen.getByText(/reset copy/i)).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByText(/reset copy/i));
    });
    expect(screen.getByText(/copy size/i)).toBeInTheDocument();
  });

  test('StyleTab tweaks fill colour', async () => {
    const spy = jest
      .spyOn(styleTools, 'tweakFillColor')
      .mockResolvedValue(undefined as unknown as void);
    await act(async () => {
      render(React.createElement(StyleTab));
    });
    fireEvent.change(screen.getByTestId('adjust-input'), {
      target: { value: '20' },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /apply/i }));
    });
    expect(spy).toHaveBeenCalledWith(0.2);
  });

  test('StyleTab syncs slider and input', async () => {
    await act(async () => {
      render(React.createElement(StyleTab));
    });
    const slider = screen.getByTestId('adjust-slider');
    await act(async () => {
      fireEvent.change(slider, { target: { value: '30' } });
    });
    const input = screen.getByTestId('adjust-input') as HTMLInputElement;
    expect(input.value).toBe('30');
  });

  test('StyleTab preview updates on change', async () => {
    await act(async () => {
      render(React.createElement(StyleTab));
    });
    const slider = screen.getByTestId('adjust-slider');
    const preview = screen.getByTestId('adjust-preview');
    const hex = screen.getByTestId('color-hex');
    await act(async () => {
      fireEvent.change(slider, { target: { value: '50' } });
    });
    expect(preview).toHaveStyle({ backgroundColor: '#c0c0c0' });
    expect(hex.textContent).toBe('#c0c0c0');
  });

  test('StyleTab displays selection colour', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).miro.board.getSelection.mockResolvedValueOnce([
      { style: { fillColor: '#123456' } },
    ]);
    await act(async () => {
      render(React.createElement(StyleTab));
    });
    await act(async () => {
      await new Promise(r => setTimeout(r, 0));
    });
    const preview = screen.getByTestId('adjust-preview');
    expect(preview.style.backgroundColor).toBe('rgb(18, 52, 86)');
  });

  test('GridTab applies layout', async () => {
    const spy = jest
      .spyOn(gridTools, 'applyGridLayout')
      .mockResolvedValue(undefined as unknown as void);
    render(React.createElement(GridTab));
    await act(async () => {
      fireEvent.click(screen.getByText(/arrange grid/i));
    });
    expect(spy).toHaveBeenCalled();
  });

  test('GridTab toggles frame title input', () => {
    render(React.createElement(GridTab));
    expect(screen.queryByPlaceholderText('Optional')).toBeNull();
    fireEvent.click(screen.getByLabelText('Group items into Frame'));
    expect(screen.getByPlaceholderText('Optional')).toBeInTheDocument();
  });

  test('SpacingTab applies layout', async () => {
    const spy = jest
      .spyOn(spacingTools, 'applySpacingLayout')
      .mockResolvedValue(undefined as unknown as void);
    render(React.createElement(SpacingTab));
    fireEvent.change(screen.getByLabelText('Mode'), {
      target: { value: 'grow' },
    });
    await act(async () => {
      fireEvent.click(screen.getByText(/distribute/i));
    });
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ axis: 'x', spacing: 20, mode: 'grow' }),
    );
  });

  test('DiagramTab processes file', async () => {
    const spy = jest
      .spyOn(GraphProcessor.prototype, 'processFile')
      .mockResolvedValue(undefined as unknown as void);
    render(React.createElement(DiagramTab));
    const input = screen.getByTestId('file-input');
    const file = new File(['{}'], 'graph.json', { type: 'application/json' });
    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });
    expect(
      screen.getByRole('group', { name: /layout type/i }),
    ).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /create diagram/i }));
    });
    expect(spy).toHaveBeenCalled();
  });

  test('CardsTab UI after file drop', async () => {
    render(React.createElement(CardsTab));
    const input = screen.getByTestId('file-input');
    const file = new File(['{}'], 'cards.json', { type: 'application/json' });
    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });
    expect(screen.getByText('cards.json')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/search cards/i)).toBeNull();
  });

  test('CardsTab processes file', async () => {
    const spy = jest
      .spyOn(CardProcessor.prototype, 'processFile')
      .mockResolvedValue(undefined as unknown as void);
    render(React.createElement(CardsTab));
    const input = screen.getByTestId('file-input');
    const file = new File(['{}'], 'cards.json', { type: 'application/json' });
    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /create cards/i }));
    });
    expect(spy).toHaveBeenCalled();
  });
});

describe('tab auto-registration', () => {
  test('includes DummyTab in development', async () => {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    const { TAB_DATA } = await import('../src/ui/pages/tabs');
    expect(TAB_DATA.some(t => t[1] === 'dummy')).toBe(true);
    process.env.NODE_ENV = prev;
  });

  test('excludes DummyTab in production', async () => {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const { TAB_DATA } = await import('../src/ui/pages/tabs?prod');
    expect(TAB_DATA.some(t => t[1] === 'dummy')).toBe(false);
    process.env.NODE_ENV = prev;
  });
});
