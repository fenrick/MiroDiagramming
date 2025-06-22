/** @jest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ResizeTab } from '../src/ui/pages/ResizeTab';
import { StyleTab } from '../src/ui/pages/StyleTab';
import { GridTab } from '../src/ui/pages/GridTab';
import { DiagramTab } from '../src/ui/pages/DiagramTab';
import { CardsTab } from '../src/ui/pages/CardsTab';
import * as resizeTools from '../src/board/resize-tools';
import * as styleTools from '../src/board/style-tools';
import * as gridTools from '../src/board/grid-tools';
import { GraphProcessor } from '../src/core/graph/GraphProcessor';
import { CardProcessor } from '../src/board/CardProcessor';
import { cardLoader } from '../src/core/utils/cards';
import type { CardData } from '../src/core/utils/cards';

jest.mock('../src/board/resize-tools');
jest.mock('../src/board/style-tools');
jest.mock('../src/board/grid-tools');
jest.mock('../src/core/graph/GraphProcessor');
jest.mock('../src/board/CardProcessor');

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

  test('StyleTab applies style', async () => {
    const spy = jest
      .spyOn(styleTools, 'applyStyleToSelection')
      .mockResolvedValue(undefined as unknown as void);
    render(React.createElement(StyleTab));
    fireEvent.change(screen.getByPlaceholderText(/fill color/i), {
      target: { value: '#f00' },
    });
    await act(async () => {
      fireEvent.click(screen.getByText(/apply style/i));
    });
    expect(spy).toHaveBeenCalled();
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

  test('CardsTab filters cards', async () => {
    jest.spyOn(cardLoader, 'loadCards').mockResolvedValue([
      { title: 'One', tags: ['t1'] },
      { title: 'Two', tags: ['t2'] },
    ] as unknown as CardData[]);
    render(React.createElement(CardsTab));
    const input = screen.getByTestId('file-input');
    const file = new File(['{}'], 'cards.json', { type: 'application/json' });
    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } });
    });
    fireEvent.change(screen.getByPlaceholderText(/search cards/i), {
      target: { value: 'Two' },
    });
    await act(async () => {
      await new Promise(r => setTimeout(r, 350));
    });
    expect(screen.getByText('Two')).toBeInTheDocument();
    expect(screen.queryByText('One')).not.toBeInTheDocument();
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
