/** @vitest-environment jsdom */
import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { CardProcessor } from '../src/board/card-processor';
import * as uiUtils from '../src/ui/hooks/ui-utils';
import { CardsTab } from '../src/ui/pages/CardsTab';

vi.mock('../src/board/card-processor');

describe('CardsTab undo paths', () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).miro = {
      board: { ui: { on: vi.fn() }, notifications: { showError: vi.fn() } },
    };
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalThis as any).miro;
    vi.useRealTimers();
  });

  test('undo via keyboard shortcut', async () => {
    vi.spyOn(CardProcessor.prototype, 'processFile').mockResolvedValue(
      undefined as unknown as void,
    );
    const undoSpy = vi
      .spyOn(uiUtils, 'undoLastImport')
      .mockResolvedValue(undefined as unknown as void);
    render(<CardsTab />);
    const file = new File(['{}'], 'cards.json', { type: 'application/json' });
    await act(async () =>
      fireEvent.change(screen.getByTestId('file-input'), {
        target: { files: [file] },
      }),
    );
    await act(async () =>
      fireEvent.click(screen.getByRole('button', { name: /create cards/i })),
    );
    fireEvent.keyDown(window, { key: 'z', metaKey: true });
    expect(undoSpy).toHaveBeenCalled();
  });
});
