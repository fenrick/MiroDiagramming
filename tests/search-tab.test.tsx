/** @vitest-environment jsdom */
import React from 'react';
import { render, fireEvent, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SearchTab } from '../src/ui/pages/SearchTab';
import * as searchTools from '../src/board/search-tools';

vi.useFakeTimers();

describe('SearchTab', () => {
  beforeEach(() => {
    vi.clearAllTimers();
  });

  test('debounced search updates match count', async () => {
    vi.spyOn(searchTools, 'searchBoardContent').mockResolvedValue([
      { item: {}, field: 't' },
    ]);
    render(<SearchTab />);
    fireEvent.change(screen.getByPlaceholderText(/search board text/i), {
      target: { value: 'hello' },
    });
    expect(searchTools.searchBoardContent).not.toHaveBeenCalled();
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    expect(searchTools.searchBoardContent).toHaveBeenCalledWith({
      query: 'hello',
    });
    expect(await screen.findByTestId('match-count')).toHaveTextContent(
      'Matches: 1',
    );
  });

  test('bulk replace calls replaceBoardContent', async () => {
    vi.spyOn(searchTools, 'searchBoardContent').mockResolvedValue([
      { item: {}, field: 't' },
    ]);
    const repSpy = vi
      .spyOn(searchTools, 'replaceBoardContent')
      .mockResolvedValue(1);
    render(<SearchTab />);
    fireEvent.change(screen.getByPlaceholderText(/search board text/i), {
      target: { value: 'foo' },
    });
    fireEvent.click(screen.getByRole('checkbox', { name: 'shape' }));
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    fireEvent.change(screen.getByPlaceholderText(/replacement text/i), {
      target: { value: 'bar' },
    });
    await act(async () => {
      fireEvent.click(screen.getByText(/replace all/i));
    });
    expect(repSpy).toHaveBeenCalledWith({
      query: 'foo',
      widgetTypes: ['shape'],
      replacement: 'bar',
    });
    expect(screen.getByTestId('match-count')).toHaveTextContent('Matches: 0');
  });

  test('filters are passed to search utilities', async () => {
    const searchSpy = vi
      .spyOn(searchTools, 'searchBoardContent')
      .mockResolvedValue([]);
    vi.spyOn(searchTools, 'replaceBoardContent').mockResolvedValue(0);
    render(<SearchTab />);
    fireEvent.change(screen.getByPlaceholderText(/search board text/i), {
      target: { value: 'test' },
    });
    fireEvent.click(screen.getByRole('checkbox', { name: 'shape' }));
    fireEvent.change(screen.getByLabelText(/tag ids/i), {
      target: { value: 't1,t2' },
    });
    fireEvent.change(screen.getByLabelText(/background colour/i), {
      target: { value: '#fff' },
    });
    fireEvent.change(screen.getByLabelText(/assignee id/i), {
      target: { value: 'u1' },
    });
    fireEvent.change(screen.getByLabelText(/creator id/i), {
      target: { value: 'c1' },
    });
    fireEvent.change(screen.getByLabelText(/last modified by/i), {
      target: { value: 'm1' },
    });
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    expect(searchSpy).toHaveBeenCalledWith({
      query: 'test',
      widgetTypes: ['shape'],
      tagIds: ['t1', 't2'],
      backgroundColor: '#fff',
      assignee: 'u1',
      creator: 'c1',
      lastModifiedBy: 'm1',
    });
  });
});
