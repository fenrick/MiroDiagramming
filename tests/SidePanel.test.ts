/**
 * @jest-environment jsdom
 */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { h } = require('preact');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { act } = require('preact/test-utils');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { render, screen } = require('@testing-library/preact');
import SidePanel from '../src/ui/SidePanel';

test('updates view when selection metadata changes', async () => {
  const getSelection = jest
    .fn()
    .mockResolvedValueOnce([])
    .mockResolvedValueOnce([
      { metadata: { 'app.miro.structgraph': { foo: 'bar' } } },
    ]);

  let handler: () => Promise<void> | void = () => {};
  const on = jest.fn((event: string, cb: () => Promise<void> | void) => {
    if (event === 'selection:update') {
      handler = cb;
    }
  });
  const off = jest.fn();
  Object.assign(globalThis, {
    miro: { board: { getSelection, ui: { on, off } } },
  });

  const { unmount } = render(h(SidePanel, {}));

  // Initially shows no selection
  await screen.findByText('No selection');

  // Emit selection update
  await act(async () => {
    await handler();
  });

  expect(screen.getByText(/"foo": "bar"/)).toBeTruthy();

  unmount();
});
