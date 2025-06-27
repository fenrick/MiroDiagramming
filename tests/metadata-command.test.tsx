/** @vitest-environment jsdom */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { App } from '../src/app/App';
import { EditMetadataModal } from '../src/ui/components/EditMetadataModal';
import { useRowData } from '../src/ui/hooks/use-row-data';
import { ExcelSyncService } from '../src/core/excel-sync-service';

interface GlobalWithMiro {
  miro?: { board?: Record<string, unknown> };
}

declare const global: GlobalWithMiro;

vi.mock('../src/ui/hooks/use-row-data');
vi.mock('../src/core/excel-sync-service');

describe('Edit Metadata command', () => {
  beforeEach(() => {
    global.miro = {
      board: {
        getSelection: vi.fn().mockResolvedValue([]),
        ui: { on: vi.fn() },
      },
    };
    (useRowData as unknown as vi.Mock).mockReturnValue({ ID: '1', Name: 'A' });
    (ExcelSyncService as unknown as vi.Mock).mockImplementation(() => ({
      updateShapesFromExcel: vi.fn().mockResolvedValue(undefined),
    }));
  });

  afterEach(() => {
    vi.clearAllMocks();
    delete global.miro;
  });

  test('opens modal and updates via service', async () => {
    render(<App />);
    await act(async () => {
      fireEvent.keyDown(window, { key: 'm', ctrlKey: true, altKey: true });
      await new Promise((r) => setTimeout(r, 0));
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.change(screen.getByDisplayValue('A'), { target: { value: 'B' } });
    const svc = (ExcelSyncService as unknown as vi.Mock).mock.results[0]
      .value as { updateShapesFromExcel: vi.Mock };
    expect(svc.updateShapesFromExcel).toHaveBeenCalled();
  });

  test('EditMetadataModal returns null without context', () => {
    render(
      <EditMetadataModal
        isOpen
        onClose={() => {}}
      />,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
