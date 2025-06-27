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
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    fireEvent.change(screen.getByPlaceholderText(/replacement text/i), {
      target: { value: 'bar' },
    });
    await act(async () => {
      fireEvent.click(screen.getByText(/replace all/i));
    });
    expect(repSpy).toHaveBeenCalledWith({ query: 'foo', replacement: 'bar' });
    expect(screen.getByTestId('match-count')).toHaveTextContent('Matches: 0');
  });
});
