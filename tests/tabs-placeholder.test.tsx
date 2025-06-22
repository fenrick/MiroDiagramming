/** @jest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TemplatesTab } from '../src/ui/pages/TemplatesTab';
import { ExportTab } from '../src/ui/pages/ExportTab';
import { DataTab } from '../src/ui/pages/DataTab';
import { CommentTab } from '../src/ui/pages/CommentTab';

describe('placeholder tabs', () => {
  test('TemplatesTab renders', () => {
    render(<TemplatesTab />);
    expect(
      screen.getByRole('heading', { name: /templates/i }),
    ).toBeInTheDocument();
  });
  test('ExportTab renders', () => {
    render(<ExportTab />);
    expect(
      screen.getByRole('heading', { name: /export/i }),
    ).toBeInTheDocument();
  });
  test('DataTab renders', () => {
    render(<DataTab />);
    expect(screen.getByRole('heading', { name: /data/i })).toBeInTheDocument();
  });
  test('CommentTab renders', () => {
    render(<CommentTab />);
    expect(
      screen.getByRole('heading', { name: /comments/i }),
    ).toBeInTheDocument();
  });
});
