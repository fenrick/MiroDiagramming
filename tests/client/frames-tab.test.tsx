/** @vitest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
/* eslint-disable no-var */
import React from 'react';
import { FramesTab } from '../src/ui/pages/FramesTab';

var renameMock: vi.Mock;
var lockMock: vi.Mock;
vi.mock('../src/board/frame-tools', () => {
  renameMock = vi.fn();
  lockMock = vi.fn();
  return { renameSelectedFrames: renameMock, lockSelectedFrames: lockMock };
});

describe('FramesTab', () => {
  test('renames frames with prefix', async () => {
    render(<FramesTab />);
    const input = screen.getByLabelText('Prefix');
    fireEvent.change(input, { target: { value: 'Frame-' } });
    fireEvent.click(screen.getByRole('button', { name: 'Rename Frames' }));
    expect(renameMock).toHaveBeenCalledWith({ prefix: 'Frame-' });
  });

  test('locks selected frames', async () => {
    render(<FramesTab />);
    fireEvent.click(screen.getByRole('button', { name: 'Lock Selected' }));
    expect(lockMock).toHaveBeenCalled();
  });
});
