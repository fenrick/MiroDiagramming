import { render, screen } from '@testing-library/react';
import React from 'react';
import { SearchTab } from '../src/ui/pages/SearchTab';

/**
 * Helper to render the SearchTab and return the search input element.
 *
 * Encapsulates boilerplate to shorten individual test cases.
 *
 * @returns The search text input element.
 */
export function renderSearchTab() {
  render(<SearchTab />);
  return screen.getByPlaceholderText(/search board text/i);
}
