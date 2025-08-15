import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import { LayoutEngineTab } from '../src/ui/pages/LayoutEngineTab';

describe('LayoutEngineTab', () =>
  test('renders placeholder message', () => {
    render(<LayoutEngineTab />);
    expect(screen.getByText('Layout engine coming soon.')).toBeInTheDocument();
  }));
