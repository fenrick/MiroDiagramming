/** @jest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ResizeTab } from '../src/tabs/ResizeTab';
import { StyleTab } from '../src/tabs/StyleTab';
import { GridTab } from '../src/tabs/GridTab';
import { DiagramTab } from '../src/tabs/DiagramTab';
import { CardsTab } from '../src/tabs/CardsTab';
import * as resizeTools from '../src/resize-tools';
import * as styleTools from '../src/style-tools';
import * as gridTools from '../src/grid-tools';
import { GraphProcessor } from '../src/GraphProcessor';
import { CardProcessor } from '../src/CardProcessor';

jest.mock('../src/resize-tools');
jest.mock('../src/style-tools');
jest.mock('../src/grid-tools');
jest.mock('../src/GraphProcessor');
jest.mock('../src/CardProcessor');

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
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /create diagram/i }));
    });
    expect(spy).toHaveBeenCalled();
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
