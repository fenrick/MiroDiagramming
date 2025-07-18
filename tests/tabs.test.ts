/** @vitest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ResizeTab } from '../src/ui/pages/ResizeTab';
import { StyleTab } from '../src/ui/pages/StyleTab';
import { ArrangeTab } from '../src/ui/pages/ArrangeTab';
import { StructuredTab } from '../src/ui/pages/StructuredTab';
import { CardsTab } from '../src/ui/pages/CardsTab';
import { FramesTab } from '../src/ui/pages/FramesTab';
import { STYLE_PRESET_NAMES } from '../src/ui/style-presets';
import * as resizeTools from '../src/board/resize-tools';
import * as styleTools from '../src/board/style-tools';
import * as formatTools from '../src/board/format-tools';
import * as gridTools from '../src/board/grid-tools';
import * as spacingTools from '../src/board/spacing-tools';
import * as frameTools from '../src/board/frame-tools';
import { GraphProcessor } from '../src/core/graph/graph-processor';
import { CardProcessor } from '../src/board/card-processor';

vi.mock('../src/board/resize-tools');
vi.mock('../src/board/style-tools', async () => {
  const actual: typeof import('../src/board/style-tools') =
    await vi.importActual('../src/board/style-tools');
  return { ...actual, tweakFillColor: jest.fn() };
});
vi.mock('../src/board/format-tools', async () => {
  const actual: typeof import('../src/board/format-tools') =
    await vi.importActual('../src/board/format-tools');
  return { ...actual, applyStylePreset: jest.fn() };
});
vi.mock('../src/board/grid-tools');
vi.mock('../src/board/spacing-tools');
vi.mock('../src/board/frame-tools');
vi.mock('../src/core/graph/graph-processor');
vi.mock('../src/board/card-processor');

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

  const COMPONENTS: Array<[string, React.FC]> = [
    ['ResizeTab', ResizeTab],
    ['StyleTab', StyleTab],
    ['ArrangeTab', ArrangeTab],
    ['StructuredTab', StructuredTab],
    ['CardsTab', CardsTab],
    ['FramesTab', FramesTab],
  ];

  test.each(COMPONENTS)('%s exposes tabpanel role', async (_, Comp) => {
    await act(async () => {
      render(React.createElement(Comp));
    });
    expect(screen.getAllByRole('tabpanel').length).toBeGreaterThan(0);
  });
  test('ResizeTab applies size', async () => {
    const spy = jest
      .spyOn(resizeTools, 'applySizeToSelection')
      .mockResolvedValue(undefined as unknown as void);
    await act(async () => {
      render(React.createElement(ResizeTab));
    });
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(/width/i), {
        target: { value: '50' },
      });
    });
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText(/height/i), {
        target: { value: '40' },
      });
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
    await act(async () => {
      render(React.createElement(ResizeTab));
    });
    await act(async () => {
      fireEvent.click(screen.getByText(/copy size/i));
    });
    expect(screen.getByText(/reset copy/i)).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByText(/reset copy/i));
    });
    expect(screen.getByText(/copy size/i)).toBeInTheDocument();
  });

  test('ResizeTab aspect ratio adjusts height', async () => {
    await act(async () => {
      render(React.createElement(ResizeTab));
    });
    const widthInput = screen.getByPlaceholderText(/width/i);
    await act(async () => {
      fireEvent.change(widthInput, { target: { value: '160' } });
    });
    await act(async () => {
      fireEvent.change(screen.getByTestId('ratio-select'), {
        target: { value: '16:9' },
      });
    });
    const heightInput = screen.getByPlaceholderText(
      /height/i,
    ) as HTMLInputElement;
    expect(heightInput.value).toBe('90');
  });

  test('ResizeTab scaling buttons apply factor', async () => {
    const spy = jest
      .spyOn(resizeTools, 'scaleSelection')
      .mockResolvedValue(undefined as unknown as void);
    await act(async () => {
      render(React.createElement(ResizeTab));
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /×2/i }));
    });
    expect(spy).toHaveBeenCalledWith(2);
  });

  test('StyleTab tweaks fill colour', async () => {
    const spy = jest
      .spyOn(styleTools, 'tweakFillColor')
      .mockResolvedValue(undefined as unknown as void);
    await act(async () => {
      render(React.createElement(StyleTab));
    });
    await act(async () => {
      fireEvent.change(screen.getByTestId('adjust-input'), {
        target: { value: '20' },
      });
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
      await new Promise((r) => setTimeout(r, 0));
    });
    const preview = screen.getByTestId('adjust-preview');
    expect(preview.style.backgroundColor).toBe('rgb(18, 52, 86)');
  });

  test('StyleTab applies preset style', async () => {
    const spy = jest
      .spyOn(formatTools, 'applyStylePreset')
      .mockResolvedValue(undefined as unknown as void);
    await act(async () => {
      render(React.createElement(StyleTab));
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /BusinessService/i }));
    });
    expect(spy).toHaveBeenCalled();
  });

  test('Style preset button displays colours', async () => {
    const style = document.documentElement.style;
    style.setProperty('--colors-blue-200', '#111111');
    style.setProperty('--colors-gray-200', '#222222');
    style.setProperty('--primary-text-color', '#ffffff');
    await act(async () => {
      render(React.createElement(StyleTab));
    });
    const btn = screen.getByRole('button', { name: /BusinessService/i });
    expect(btn).toBeInTheDocument();
    style.removeProperty('--colors-blue-200');
    style.removeProperty('--colors-gray-200');
    style.removeProperty('--primary-text-color');
  });

  test('StyleTab buttons use type button', async () => {
    await act(async () => {
      render(React.createElement(StyleTab));
    });
    expect(screen.getByRole('button', { name: /apply/i })).toHaveAttribute(
      'type',
      'button',
    );
    const first = STYLE_PRESET_NAMES[0];
    expect(
      screen.getByRole('button', { name: new RegExp(first, 'i') }),
    ).toHaveAttribute('type', 'button');
  });

  test('ArrangeTab applies grid layout', async () => {
    const spy = jest
      .spyOn(gridTools, 'applyGridLayout')
      .mockResolvedValue(undefined as unknown as void);
    await act(async () => {
      render(React.createElement(ArrangeTab));
    });
    await act(async () => {
      fireEvent.click(screen.getByText(/arrange grid/i));
    });
    expect(spy).toHaveBeenCalled();
  });

  test('ArrangeTab toggles frame title input', async () => {
    await act(async () => {
      render(React.createElement(ArrangeTab));
    });
    expect(screen.queryByPlaceholderText('Optional')).toBeNull();
    await act(async () => {
      fireEvent.click(screen.getByLabelText('Group items into Frame'));
    });
    expect(screen.getByPlaceholderText('Optional')).toBeInTheDocument();
  });

  test('ArrangeTab applies spacing layout', async () => {
    const spy = jest
      .spyOn(spacingTools, 'applySpacingLayout')
      .mockResolvedValue(undefined as unknown as void);
    await act(async () => {
      render(React.createElement(ArrangeTab));
    });
    await act(async () => {
      fireEvent.change(screen.getByLabelText('Mode'), {
        target: { value: 'grow' },
      });
    });
    await act(async () => {
      fireEvent.click(screen.getByText(/distribute/i));
    });
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ axis: 'x', spacing: 20, mode: 'grow' }),
    );
  });

  test('FramesTab renames frames', async () => {
    const spy = jest
      .spyOn(frameTools, 'renameSelectedFrames')
      .mockResolvedValue(undefined as unknown as void);
    await act(async () => {
      render(React.createElement(FramesTab));
    });
    await act(async () => {
      fireEvent.change(screen.getByLabelText('Prefix'), {
        target: { value: 'A-' },
      });
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /rename frames/i }));
    });
    expect(spy).toHaveBeenCalledWith({ prefix: 'A-' });
  });

  test('FramesTab locks frames', async () => {
    const spy = jest
      .spyOn(frameTools, 'lockSelectedFrames')
      .mockResolvedValue(undefined as unknown as void);
    await act(async () => {
      render(React.createElement(FramesTab));
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /lock selected/i }));
    });
    expect(spy).toHaveBeenCalled();
  });

  test('StructuredTab processes file', async () => {
    const spy = jest
      .spyOn(GraphProcessor.prototype, 'processFile')
      .mockResolvedValue(undefined as unknown as void);
    await act(async () => {
      render(React.createElement(StructuredTab));
    });
    const input = screen.getByTestId('file-input');
    const file = new File(['{}'], 'graph.json', { type: 'application/json' });
    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });
    expect(
      screen.getByRole('combobox', { name: /layout type/i }),
    ).toBeInTheDocument();
    for (const option of [
      'Layered',
      'Tree',
      'Grid',
      'Nested',
      'Radial',
      'Box',
      'Rect Packing',
    ]) {
      expect(screen.getByRole('option', { name: option })).toBeInTheDocument();
    }
    expect(screen.getByText(/layout options/i)).toBeInTheDocument();
    expect(
      screen.getByText(/circular layout around a hub/i),
    ).toBeInTheDocument();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /create diagram/i }));
    });
    expect(spy).toHaveBeenCalled();
  });

  test('CardsTab UI after file drop', async () => {
    await act(async () => {
      render(React.createElement(CardsTab));
    });
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
    await act(async () => {
      render(React.createElement(CardsTab));
    });
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
  test('includes DummyTab in test environment', async () => {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = 'test';
    const { TAB_DATA } = await import('../src/ui/pages/tabs.ts?test');
    expect(TAB_DATA.some((t) => t[1] === 'dummy')).toBe(true);
    process.env.NODE_ENV = prev;
  });

  test('excludes DummyTab in development', async () => {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    const { TAB_DATA } = await import('../src/ui/pages/tabs.ts?dev');
    expect(TAB_DATA.some((t) => t[1] === 'dummy')).toBe(false);
    process.env.NODE_ENV = prev;
  });

  test('excludes DummyTab in production', async () => {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const { TAB_DATA } = await import('../src/ui/pages/tabs.ts?prod');
    expect(TAB_DATA.some((t) => t[1] === 'dummy')).toBe(false);
    process.env.NODE_ENV = prev;
  });

  test('includes HelpTab in all environments', async () => {
    const envs = ['test', 'development', 'production'] as const;
    for (const env of envs) {
      const prev = process.env.NODE_ENV;
      process.env.NODE_ENV = env;
      const { TAB_DATA } =
        env === 'test'
          ? await import('../src/ui/pages/tabs.ts?test')
          : env === 'development'
            ? await import('../src/ui/pages/tabs.ts?dev')
            : await import('../src/ui/pages/tabs.ts?prod');
      expect(TAB_DATA.some((t) => t[1] === 'help')).toBe(true);
      process.env.NODE_ENV = prev;
    }
  });

  test('includes ToolsTab by default', async () => {
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = 'test';
    const { TAB_DATA } = await import('../src/ui/pages/tabs.ts?test');
    expect(TAB_DATA.some((t) => t[1] === 'tools')).toBe(true);
    process.env.NODE_ENV = prev;
  });
});
